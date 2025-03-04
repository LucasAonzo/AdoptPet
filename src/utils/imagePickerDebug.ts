import * as ImagePicker from 'expo-image-picker';

/**
 * Utility to debug available ImagePicker properties
 * @returns {string} - Message to check console for debug info
 */
export const debugImagePicker = (): string => {
  console.log('ImagePicker available properties:');
  
  // Log all root-level properties
  Object.keys(ImagePicker).forEach(key => {
    console.log(`- ${key}: ${typeof ImagePicker[key as keyof typeof ImagePicker]}`);
    
    // If it's an object, log its properties too
    const value = ImagePicker[key as keyof typeof ImagePicker];
    if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach(subKey => {
        const subValue = (value as Record<string, any>)[subKey];
        console.log(`  - ${key}.${subKey}: ${subValue}`);
      });
    }
  });
  
  // Try to identify the correct media types property
  const possibleMediaTypeProps: Array<keyof typeof ImagePicker | string> = [
    'MediaType', 
    'MediaTypeOptions', 
    'MediaTypes',
    'ImageType'
  ];
  
  console.log('\nPossible media type properties:');
  possibleMediaTypeProps.forEach(prop => {
    const exists = prop in ImagePicker;
    console.log(`- ${prop}: ${exists ? 'Available' : 'Not found'}`);
  });
  
  return 'Check console for ImagePicker debug info';
};

export default debugImagePicker; 