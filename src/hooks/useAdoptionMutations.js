import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import supabase from '../config/supabase';
import { showAlert } from '../utils/alertUtils';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

/**
 * Hook to submit a new adoption application
 */
export const useSubmitAdoptionApplication = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (applicationData) => {
      if (!user) {
        throw new Error('User must be logged in to submit an application');
      }

      // Prepare application data
      const application = {
        user_id: user.id,
        animal_id: applicationData.animalId,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        application_data: applicationData.form || applicationData.application_data,
      };

      console.log('Submitting application:', JSON.stringify(application, null, 2));

      // Insert application into database
      const { data, error } = await supabase
        .from('adoption_applications')
        .insert(application)
        .select()
        .single();

      if (error) {
        console.error('Error submitting application:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['user-applications'] });
      
      showAlert({
        title: 'Application Submitted',
        message: 'Your adoption application has been submitted successfully!',
        type: 'success',
      });
    },
    onError: (error) => {
      showAlert({
        title: 'Submission Failed',
        message: `Failed to submit application: ${error.message}`,
        type: 'error',
      });
    },
  });
};

/**
 * Hook to fetch user's adoption applications
 */
export const useUserApplications = (status = null) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-applications', user?.id, status],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      try {
        // First, fetch the user's applications
        let query = supabase
          .from('adoption_applications')
          .select('*')
          .eq('user_id', user.id);

        // Add status filter if provided
        if (status) {
          query = query.eq('status', status);
        }

        // Order by submission date (newest first)
        query = query.order('submitted_at', { ascending: false });

        const { data: applications, error } = await query;

        if (error) {
          console.error('Error fetching user applications:', error);
          throw new Error(`Error fetching user applications: ${JSON.stringify(error)}`);
        }

        if (!applications || applications.length === 0) {
          return [];
        }

        // Then fetch animal details for each application
        const animalIds = applications.map(app => app.animal_id);
        
        const { data: animals, error: animalError } = await supabase
          .from('animals')
          .select('*')
          .in('id', animalIds);

        if (animalError) {
          console.error('Error fetching animal details:', animalError);
          throw new Error(`Error fetching animal details: ${JSON.stringify(animalError)}`);
        }

        // Combine the data
        const combinedData = applications.map(app => {
          const animal = animals.find(a => a.id === app.animal_id) || null;
          return {
            ...app,
            submitted_at_formatted: format(new Date(app.submitted_at), 'PPP'),
            animals: animal
          };
        });

        return combinedData;
      } catch (error) {
        console.error('Error in useUserApplications:', error);
        throw error;
      }
    },
    enabled: !!user,
  });
};

/**
 * Hook to fetch a specific adoption application details
 */
export const useApplicationDetails = (applicationId) => {
  return useQuery({
    queryKey: ['application-details', applicationId],
    queryFn: async () => {
      if (!applicationId) {
        return null;
      }

      try {
        // Fetch the application details first
        const { data: application, error } = await supabase
          .from('adoption_applications')
          .select('*')
          .eq('id', applicationId)
          .single();

        if (error) {
          console.error('Error fetching application details:', error);
          throw new Error(`Error fetching application details: ${JSON.stringify(error)}`);
        }

        // Fetch the animal details
        const { data: animal, error: animalError } = await supabase
          .from('animals')
          .select('*')
          .eq('id', application.animal_id)
          .single();

        if (animalError) {
          console.error('Error fetching animal details:', animalError);
          throw new Error(`Error fetching animal details: ${JSON.stringify(animalError)}`);
        }

        // Fetch the user details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', application.user_id)
          .single();

        if (userError) {
          console.error('Error fetching user details:', userError);
          throw new Error(`Error fetching user details: ${JSON.stringify(userError)}`);
        }

        // Combine all the data
        return {
          ...application,
          submitted_at_formatted: format(new Date(application.submitted_at), 'PPP'),
          animals: animal,
          users: userData
        };
      } catch (error) {
        console.error('Error in useApplicationDetails:', error);
        throw error;
      }
    },
    enabled: !!applicationId,
  });
};

/**
 * Hook to update an adoption application status
 */
export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, status, note }) => {
      const { data, error } = await supabase
        .from('adoption_applications')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          admin_notes: note || null,
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating application status:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['user-applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-details'] });
      
      showAlert({
        title: 'Status Updated',
        message: 'Application status has been updated successfully',
        type: 'success',
      });
    },
    onError: (error) => {
      showAlert({
        title: 'Update Failed',
        message: `Failed to update application status: ${error.message}`,
        type: 'error',
      });
    },
  });
};

/**
 * Hook for shelters to fetch adoption applications for their animals
 */
export const useShelterApplications = (status = null) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['shelter-applications', user?.id, status],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      try {
        // First get the shelter ID for this user (assuming they're a shelter admin)
        const { data: shelterData, error: shelterError } = await supabase
          .from('shelters')
          .select('id')
          .eq('admin_id', user.id)
          .single();

        if (shelterError || !shelterData) {
          console.error('Error fetching shelter ID or user is not a shelter admin', shelterError);
          return [];
        }

        // First, get all animals belonging to this shelter
        const { data: shelterAnimals, error: animalsError } = await supabase
          .from('animals')
          .select('id')
          .eq('shelter_id', shelterData.id);

        if (animalsError || !shelterAnimals) {
          console.error('Error fetching shelter animals:', animalsError);
          return [];
        }

        const animalIds = shelterAnimals.map(animal => animal.id);
        
        if (animalIds.length === 0) {
          return []; // No animals, so no applications
        }

        // Now get all applications for these animals
        let query = supabase
          .from('adoption_applications')
          .select('*')
          .in('animal_id', animalIds);

        // Add status filter if provided
        if (status) {
          query = query.eq('status', status);
        }

        // Order by submission date (newest first)
        query = query.order('submitted_at', { ascending: false });

        const { data: applications, error } = await query;

        if (error) {
          console.error('Error fetching shelter applications:', error);
          throw new Error(`Error fetching shelter applications: ${JSON.stringify(error)}`);
        }

        if (!applications || applications.length === 0) {
          return [];
        }

        // Fetch animal details for the applications
        const { data: animals, error: animalDetailsError } = await supabase
          .from('animals')
          .select('*')
          .in('id', applications.map(app => app.animal_id));

        if (animalDetailsError) {
          console.error('Error fetching animal details:', animalDetailsError);
          throw new Error(`Error fetching animal details: ${JSON.stringify(animalDetailsError)}`);
        }

        // Fetch user details for the applications
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('id', applications.map(app => app.user_id));

        if (usersError) {
          console.error('Error fetching user details:', usersError);
          throw new Error(`Error fetching user details: ${JSON.stringify(usersError)}`);
        }

        // Combine all the data
        return applications.map(app => {
          const animal = animals.find(a => a.id === app.animal_id) || null;
          const user = users.find(u => u.id === app.user_id) || null;
          return {
            ...app,
            submitted_at_formatted: format(new Date(app.submitted_at), 'PPP'),
            animals: animal,
            users: user
          };
        });
      } catch (error) {
        console.error('Error in useShelterApplications:', error);
        throw error;
      }
    },
    enabled: !!user,
  });
};

/**
 * Hook to check if user has a pending application for an animal
 */
export const useCheckPendingApplication = (animalId) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pending-application', user?.id, animalId],
    queryFn: async () => {
      if (!user || !animalId) {
        return { hasApplication: false };
      }

      const { data, error } = await supabase
        .from('adoption_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('animal_id', animalId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        console.error('Error checking pending application:', error);
        throw new Error(error.message);
      }

      return {
        hasApplication: !!data,
        applicationDetails: data || null,
      };
    },
    enabled: !!user && !!animalId,
  });
};