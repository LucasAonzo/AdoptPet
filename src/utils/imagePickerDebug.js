import * as ImagePicker from 'expo-image-picker';

/**
 * Utility to debug available ImagePicker properties
 */
export const debugImagePicker = () => {
  console.log('ImagePicker available properties:');
  
  // Log all root-level properties
  Object.keys(ImagePicker).forEach(key => {
    console.log(`- ${key}: ${typeof ImagePicker[key]}`);
    
    // If it's an object, log its properties too
    if (typeof ImagePicker[key] === 'object' && ImagePicker[key] !== null) {
      Object.keys(ImagePicker[key]).forEach(subKey => {
        console.log(`  - ${key}.${subKey}: ${ImagePicker[key][subKey]}`);
      });
    }
  });
  
  // Try to identify the correct media types property
  const possibleMediaTypeProps = [
    'MediaType', 
    'MediaTypeOptions', 
    'MediaTypes',
    'ImageType'
  ];
  
  console.log('\nPossible media type properties:');
  possibleMediaTypeProps.forEach(prop => {
    console.log(`- ${prop}: ${ImagePicker[prop] ? 'Available' : 'Not found'}`);
  });
  
  return 'Check console for ImagePicker debug info';
};

export default debugImagePicker; 