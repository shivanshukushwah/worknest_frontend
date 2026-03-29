import { StudentProfile, EmployerProfile } from '@mytypes/index';

/**
 * Calculate the profile completion percentage for a student
 * Based on: name, email, phone, age, location, skills, education, avatar
 */
export const calculateStudentProfileCompletion = (profile: StudentProfile): {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
} => {
  const fields = {
    name: !!profile.name,
    email: !!profile.email,
    phone: !!profile.phone,
    age: !!profile.age,
    city: !!profile.city,
    state: !!profile.state,
    country: !!profile.country,
    skills: Array.isArray(profile.skills) && profile.skills.length > 0,
    education: Array.isArray(profile.education) && profile.education.length > 0,
    avatar: !!profile.avatar,
  };

  const totalFields = Object.keys(fields).length;
  const completedCount = Object.values(fields).filter(Boolean).length;
  const percentage = Math.round((completedCount / totalFields) * 100);

  const completedFields = Object.entries(fields)
    .filter(([_, completed]) => completed)
    .map(([field, _]) => field);

  const missingFields = Object.entries(fields)
    .filter(([_, completed]) => !completed)
    .map(([field, _]) => field);

  return { percentage, completedFields, missingFields };
};

/**
 * Calculate the profile completion percentage for an employer
 */
export const calculateEmployerProfileCompletion = (profile: EmployerProfile): {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
} => {
  const fields = {
    name: !!profile.name,
    email: !!profile.email,
    phone: !!profile.phone,
    businessName: !!profile.businessName,
    businessType: !!profile.businessType,
    businessLocation: !!(profile.businessLocation && 
      (typeof profile.businessLocation === 'object' ? 
        profile.businessLocation.city : profile.businessLocation)),
    avatar: !!profile.avatar,
  };

  const totalFields = Object.keys(fields).length;
  const completedCount = Object.values(fields).filter(Boolean).length;
  const percentage = Math.round((completedCount / totalFields) * 100);

  const completedFields = Object.entries(fields)
    .filter(([_, completed]) => completed)
    .map(([field, _]) => field);

  const missingFields = Object.entries(fields)
    .filter(([_, completed]) => !completed)
    .map(([field, _]) => field);

  return { percentage, completedFields, missingFields };
};

/**
 * Get a descriptive message based on profile completion percentage
 */
export const getProfileCompletionMessage = (percentage: number): string => {
  if (percentage === 100) {
    return '🎉 Your profile is complete!';
  } else if (percentage >= 80) {
    return '📝 Almost there! Complete a few more fields.';
  } else if (percentage >= 50) {
    return '⚡ Complete your profile to unlock all features.';
  } else {
    return '👤 Start building your profile.';
  }
};

/**
 * Get color based on completion percentage
 */
export const getCompletionColor = (percentage: number): string => {
  if (percentage >= 80) {
    return '#34C759'; // Green
  } else if (percentage >= 50) {
    return '#FF9500'; // Orange
  } else {
    return '#FF3B30'; // Red
  }
};
