// Profile validation helper functions
import { StudentProfile, StudentProfileValidation } from '@mytypes/index';

export const isProfileComplete = (profile: StudentProfile | null): boolean => {
  if (!profile) return false;

  const hasPhoneVerified = profile.isPhoneVerified || false;
  const hasAge = profile.age && profile.age > 0;
  // location might be flattened or nested inside profile.location
  const loc = (profile as any).location || {};
  const hasLocation =
    (profile.city && profile.state && profile.country) ||
    (loc.city && loc.state && loc.country);
  // skills may be array or comma-separated string
  let hasSkills = false;
  if (Array.isArray(profile.skills)) {
    hasSkills = profile.skills.length > 0;
  } else if (typeof profile.skills === 'string') {
    hasSkills = profile.skills.trim() !== '';
  }
  let hasEducation = false;
  if (Array.isArray(profile.education)) {
    hasEducation = profile.education.length > 0;
  } else if (typeof profile.education === 'string') {
    hasEducation = profile.education.trim() !== '';
  }

  return !!(hasPhoneVerified && hasAge && hasLocation && hasSkills && hasEducation);
};

export const getProfileCompletionPercentage = (profile: StudentProfile | null): number => {
  if (!profile) return 0;

  let completed = 0;
  const total = 5;

  if (profile.isPhoneVerified) completed++;
  if (profile.age && profile.age > 0) completed++;
  const loc = (profile as any).location || {};
  if (
    (profile.city && profile.state && profile.country) ||
    (loc.city && loc.state && loc.country)
  )
    completed++;
  if (
    (Array.isArray(profile.skills) && profile.skills.length > 0) ||
    (typeof profile.skills === 'string' && profile.skills.trim() !== '')
  )
    completed++;
  if (
    (Array.isArray(profile.education) && profile.education.length > 0) ||
    (typeof profile.education === 'string' && profile.education.trim() !== '')
  )
    completed++;

  return Math.round((completed / total) * 100);
};

export const getMissingProfileFields = (profile: StudentProfile | null): string[] => {
  if (!profile) return ['phone', 'age', 'location', 'skills', 'education'];

  const missing: string[] = [];

  if (!profile.isPhoneVerified) missing.push('phone');
  if (!profile.age || profile.age <= 0) missing.push('age');
  const loc = (profile as any).location || {};
  if (
    !(
      (profile.city && profile.state && profile.country) ||
      (loc.city && loc.state && loc.country)
    )
  )
    missing.push('location');
  if (
    !(
      (Array.isArray(profile.skills) && profile.skills.length > 0) ||
      (typeof profile.skills === 'string' && profile.skills.trim() !== '')
    )
  )
    missing.push('skills');
  if (
    !(
      (Array.isArray(profile.education) && profile.education.length > 0) ||
      (typeof profile.education === 'string' && profile.education.trim() !== '')
    )
  )
    missing.push('education');

  return missing;
};

export const getProfileValidationStatus = (profile: StudentProfile | null): StudentProfileValidation => {
  if (!profile) {
    return {
      phoneVerified: false,
      skillsAdded: false,
      educationAdded: false,
    };
  }

  return {
    phoneVerified: profile.isPhoneVerified || false,
    age: profile.age,
    city: profile.city,
    state: profile.state,
    country: profile.country,
    skillsAdded: profile.skills && profile.skills.length > 0,
    educationAdded: profile.education && profile.education.length > 0,
  };
};
