import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Screen, Card, TextField, Button, Badge } from '@components/index';
import { useAuth } from '@context/AuthContext';
import { useUser } from '@context/UserContext';
import { UserRole } from '@mytypes/index';
import { Ionicons } from '@expo/vector-icons';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { studentProfile, updateStudentProfile, isLoadingStudent, uploadAvatar } = useUser();

  // Form states for STUDENT
  const [age, setAge] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [education, setEducation] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Form states for WORKER
  const [workerSkills, setWorkerSkills] = useState<string>('');
  const [workerExperience, setWorkerExperience] = useState<string>('');
  const [workerLocation, setWorkerLocation] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStudentRole = user?.role === UserRole.STUDENT;
  const isWorkerRole = user?.role === UserRole.WORKER;

  // Sync form fields when studentProfile loads
  useEffect(() => {
    if (studentProfile && isStudentRole) {
      setAge(studentProfile?.age?.toString() || '');
      setCity(studentProfile?.city || '');
      setState(studentProfile?.state || '');
      setCountry(studentProfile?.country || '');
      setProfilePhoto(studentProfile?.avatar || null);
      // Handle both string and array for skills
      if (Array.isArray(studentProfile?.skills)) {
        setSkills(studentProfile.skills.join(', '));
      } else {
        setSkills(studentProfile?.skills || '');
      }
      // Handle both string and array for education
      if (Array.isArray(studentProfile?.education)) {
        const educationText = studentProfile.education
          .map((e: any) => e.degree || e)
          .join(', ');
        setEducation(educationText);
      } else {
        setEducation(studentProfile?.education || '');
      }
    } else if (studentProfile && isWorkerRole) {
      setWorkerSkills(studentProfile?.skills?.[0] || '');
      setWorkerExperience(studentProfile?.experience?.toString() || '');
      setWorkerLocation(studentProfile?.city || '');
      setProfilePhoto(studentProfile?.avatar || null);
    }
  }, [studentProfile, isStudentRole, isWorkerRole]);

  // Validation checks for STUDENT
  const studentHasPhoneVerified = user?.isPhoneVerified || false;
  const studentHasAge = age !== '';
  const studentHasLocation = city !== '' && state !== '' && country !== '';
  const studentHasSkills = skills.trim() !== '';
  const studentHasEducation = education.trim() !== '';
  const studentIsProfileComplete =
    studentHasPhoneVerified && studentHasAge && studentHasLocation && studentHasSkills && studentHasEducation;

  // Validation checks for WORKER
  const workerHasPhoneVerified = user?.isPhoneVerified || false;
  const workerHasSkills = workerSkills !== '';
  const workerHasExperience = workerExperience !== '';
  const workerHasLocation = workerLocation !== '';
  const workerIsProfileComplete = workerHasPhoneVerified && workerHasSkills && workerHasExperience && workerHasLocation;

  const isProfileComplete = isStudentRole ? studentIsProfileComplete : workerIsProfileComplete;

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
      const calculatedAge = new Date().getFullYear() - date.getFullYear();
      setAge(calculatedAge.toString());
    }
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    if (!isProfileComplete) {
      Alert.alert('Incomplete Profile', 'Please fill all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isStudentRole) {
        await updateStudentProfile({
          age: parseInt(age),
          city,
          state,
          country,
          skills: skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== ''),
          education,
        });
      } else if (isWorkerRole) {
        await updateStudentProfile({
          skills: [workerSkills],
          experience: parseInt(workerExperience),
          city: workerLocation,
        });
      }
      Alert.alert('Success', 'Profile updated successfully');
      router.replace('/(student)');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Setup',
      'You can complete your profile later from the profile screen',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Skip',
          onPress: () => router.replace('/(student)'),
        },
      ]
    );
  };

  if (isLoadingStudent) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Card>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Fill in the required information to get started
            </Text>
          </View>
        </Card>

        {/* Validation Checklist - STUDENT */}
        {isStudentRole && (
          <Card>
            <Text style={styles.sectionTitle}>Profile Requirements</Text>
            <View style={styles.checklistContainer}>
              {/* Phone Verification */}
              <View style={styles.checklistItem}>
                <View
                  style={[
                    styles.checkbox,
                    studentHasPhoneVerified && styles.checkboxChecked,
                  ]}
                >
                  {studentHasPhoneVerified && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.checklistText}>
                  <Text style={styles.checklistLabel}>Phone Verified</Text>
                  {!studentHasPhoneVerified && (
                    <Text style={styles.checklistHint}>
                      Verify your phone number in settings
                    </Text>
                  )}
                </View>
              </View>

              {/* Age */}
              <View style={styles.checklistItem}>
                <View
                  style={[styles.checkbox, studentHasAge && styles.checkboxChecked]}
                >
                  {studentHasAge && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <View style={styles.checklistText}>
                  <Text style={styles.checklistLabel}>Age</Text>
                  {studentHasAge && <Text style={styles.checklistHint}>{age} years</Text>}
                </View>
              </View>

              {/* Location */}
              <View style={styles.checklistItem}>
                <View
                  style={[
                    styles.checkbox,
                    studentHasLocation && styles.checkboxChecked,
                  ]}
                >
                  {studentHasLocation && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.checklistText}>
                  <Text style={styles.checklistLabel}>Location</Text>
                  {studentHasLocation && (
                    <Text style={styles.checklistHint}>
                      {city}, {state}, {country}
                    </Text>
                  )}
                </View>
              </View>

              {/* Skills */}
              <View style={styles.checklistItem}>
                <View
                  style={[
                    styles.checkbox,
                    studentHasSkills && styles.checkboxChecked,
                  ]}
                >
                  {studentHasSkills && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.checklistText}>
                  <Text style={styles.checklistLabel}>Skills Added</Text>
                  {studentHasSkills && (
                    <Text style={styles.checklistHint}>{skills}</Text>
                  )}
                  {!studentHasSkills && (
                    <Text style={styles.checklistHint}>
                      Add at least one skill
                    </Text>
                  )}
                </View>
              </View>

              {/* Education */}
              <View style={styles.checklistItem}>
                <View
                  style={[
                    styles.checkbox,
                    studentHasEducation && styles.checkboxChecked,
                  ]}
                >
                  {studentHasEducation && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.checklistText}>
                  <Text style={styles.checklistLabel}>Education Added</Text>
                  {studentHasEducation && (
                    <Text style={styles.checklistHint}>{education}</Text>
                  )}
                  {!studentHasEducation && (
                    <Text style={styles.checklistHint}>
                      Add your education details
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Validation Checklist - WORKER */}
        {isWorkerRole && (
          <Card>
            <Text style={styles.sectionTitle}>Profile Requirements</Text>
            <View style={styles.checklistContainer}>
              {/* Phone Verification */}
              <View style={styles.checklistItem}>
                <View
                  style={[
                    styles.checkbox,
                    workerHasPhoneVerified && styles.checkboxChecked,
                  ]}
                >
                  {workerHasPhoneVerified && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.checklistText}>
                  <Text style={styles.checklistLabel}>Phone Verified</Text>
                  {!workerHasPhoneVerified && (
                    <Text style={styles.checklistHint}>
                      Verify your phone number in settings
                    </Text>
                  )}
                </View>
              </View>

              {/* Skills */}
              <View style={styles.checklistItem}>
                <View
                  style={[
                    styles.checkbox,
                    workerHasSkills && styles.checkboxChecked,
                  ]}
                >
                  {workerHasSkills && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.checklistText}>
                  <Text style={styles.checklistLabel}>Skills</Text>
                  {workerHasSkills && (
                    <Text style={styles.checklistHint}>{workerSkills}</Text>
                  )}
                </View>
              </View>

              {/* Experience */}
              <View style={styles.checklistItem}>
                <View
                  style={[
                    styles.checkbox,
                    workerHasExperience && styles.checkboxChecked,
                  ]}
                >
                  {workerHasExperience && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.checklistText}>
                  <Text style={styles.checklistLabel}>Experience</Text>
                  {workerHasExperience && (
                    <Text style={styles.checklistHint}>{workerExperience} years</Text>
                  )}
                </View>
              </View>

              {/* Location */}
              <View style={styles.checklistItem}>
                <View
                  style={[
                    styles.checkbox,
                    workerHasLocation && styles.checkboxChecked,
                  ]}
                >
                  {workerHasLocation && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <View style={styles.checklistText}>
                  <Text style={styles.checklistLabel}>Location</Text>
                  {workerHasLocation && (
                    <Text style={styles.checklistHint}>{workerLocation}</Text>
                  )}
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Profile Photo - STUDENT */}
        {isStudentRole && (
          <Card>
            <Text style={styles.sectionTitle}>Profile Photo</Text>
            <View style={styles.photoContainer}>
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="person" size={48} color="#bbb" />
                </View>
              )}
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => Alert.alert('Photo Upload', 'Photo upload feature coming soon!')}
              >
                <Ionicons name="camera" size={16} color="#fff" />
                <Text style={styles.uploadButtonText}>Add Photo</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Form Fields - STUDENT */}
        {isStudentRole && (
          <Card>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            {/* Age */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Age *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#007AFF" />
                <Text style={styles.dateButtonText}>
                  {age ? `${age} years` : 'Select your birth date'}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* City */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>City *</Text>
              <TextField
                placeholder="Enter your city"
                value={city}
                onChangeText={setCity}
                editable={!isSubmitting}
              />
            </View>

            {/* State */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>State *</Text>
              <TextField
                placeholder="Enter your state"
                value={state}
                onChangeText={setState}
                editable={!isSubmitting}
              />
            </View>

            {/* Country */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Country *</Text>
              <TextField
                placeholder="Enter your country"
                value={country}
                onChangeText={setCountry}
                editable={!isSubmitting}
              />
            </View>

            {/* Skills */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Skills * (comma-separated)</Text>
              <TextField
                placeholder="e.g. JavaScript, React, Design"
                value={skills}
                onChangeText={setSkills}
                editable={!isSubmitting}
                multiline
              />
            </View>

            {/* Education */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Education *</Text>
              <TextField
                placeholder="e.g. B.Tech Computer Science"
                value={education}
                onChangeText={setEducation}
                editable={!isSubmitting}
                multiline
              />
            </View>
          </Card>
        )}

        {/* Form Fields - WORKER */}
        {isWorkerRole && (
          <Card>
            <Text style={styles.sectionTitle}>Professional Information</Text>

            {/* Skills */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Skills *</Text>
              <TextField
                placeholder="e.g. plumbing, carpentry, electrician"
                value={workerSkills}
                onChangeText={setWorkerSkills}
                editable={!isSubmitting}
              />
            </View>

            {/* Experience */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Experience (Years) *</Text>
              <TextField
                placeholder="e.g. 5"
                keyboardType="number-pad"
                value={workerExperience}
                onChangeText={setWorkerExperience}
                editable={!isSubmitting}
              />
            </View>

            {/* Location */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Location *</Text>
              <TextField
                placeholder="e.g. New Delhi"
                value={workerLocation}
                onChangeText={setWorkerLocation}
                editable={!isSubmitting}
              />
            </View>
          </Card>
        )}

        {/* Profile Completion Status */}
        <Card>
          <Text style={styles.sectionTitle}>Completion Status</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      isStudentRole
                        ? ((studentHasPhoneVerified ? 1 : 0) +
                            (studentHasAge ? 1 : 0) +
                            (studentHasLocation ? 1 : 0) +
                            (studentHasSkills ? 1 : 0) +
                            (studentHasEducation ? 1 : 0)) *
                          20
                        : ((workerHasPhoneVerified ? 1 : 0) +
                            (workerHasSkills ? 1 : 0) +
                            (workerHasExperience ? 1 : 0) +
                            (workerHasLocation ? 1 : 0)) *
                          25
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {isStudentRole
                ? `${
                    ((studentHasPhoneVerified ? 1 : 0) +
                      (studentHasAge ? 1 : 0) +
                      (studentHasLocation ? 1 : 0) +
                      (studentHasSkills ? 1 : 0) +
                      (studentHasEducation ? 1 : 0)) * 20
                  }%`
                : `${
                    ((workerHasPhoneVerified ? 1 : 0) +
                      (workerHasSkills ? 1 : 0) +
                      (workerHasExperience ? 1 : 0) +
                      (workerHasLocation ? 1 : 0)) * 25
                  }%`}
            </Text>
            {!isProfileComplete && (
              <Text style={styles.progressHint}>Complete your profile</Text>
            )}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title={isSubmitting ? 'Saving...' : 'Save Profile'}
            onPress={handleSubmit}
            disabled={!isProfileComplete || isSubmitting}
            fullWidth
          />
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={isSubmitting}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  checklistContainer: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checklistText: {
    flex: 1,
  },
  checklistLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  checklistHint: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  photoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  progressHint: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
