import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import { Screen, Card, Avatar, Button, Badge, ProfileCompletion, ProfilePictureModal, TextField } from '@components/index';
import { useAuth } from '@context/AuthContext';
import { useUser } from '@context/UserContext';
import { UserRole } from '@mytypes/index';
import type { StudentProfile, EmployerProfile } from '@mytypes/index';
import { userAPI } from '@api/auth';
import {
  calculateStudentProfileCompletion,
  calculateEmployerProfileCompletion,
} from '@utils/profile-completion';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@utils/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUserAvatar } = useAuth();

  const {
    studentProfile,
    employerProfile,
    isLoadingStudent,
    isLoadingEmployer,
    fetchStudentProfile,
    fetchEmployerProfile,
    refreshProfile,
    uploadAvatar,
  } = useUser();

  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Form states initialization
  const [formState, setFormState] = useState<any>({
    phone: '',
    age: '',
    city: '',
    state: '',
    country: '',
    bio: '',
    skills: '',
    businessName: '',
    businessType: '',
    businessLocation: { city: '', state: '' }
  });

  useEffect(() => {
    if (user?.role === UserRole.STUDENT) {
      fetchStudentProfile();
    } else if (user?.role === UserRole.EMPLOYER) {
      fetchEmployerProfile();
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEditProfile = () => {
    if (user?.role === UserRole.STUDENT) {
      const sp = studentProfile as StudentProfile;
      setFormState({
        phone: user?.phone || '',
        age: sp?.age?.toString() || '',
        city: sp?.city || '',
        state: sp?.state || '',
        country: sp?.country || '',
        bio: sp?.bio || '',
        skills: sp?.skills?.join(', ') || '',
      });
    } else {
      const ep = employerProfile as EmployerProfile;
      setFormState({
        phone: user?.phone || '',
        businessName: ep?.businessName || '',
        businessType: ep?.businessType || '',
        businessLocation: ep?.businessLocation || { city: '', state: '' },
      });
    }
    setShowEditModal(true);
  }

  const handleSaveStudentProfile = async () => {
    if (!formState.phone.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number');
      return;
    }

    setIsUpdating(true);
    try {
      const skillsArray = formState.skills
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      const updateData: any = {
        phone: formState.phone,
        bio: formState.bio,
        age: formState.age ? parseInt(formState.age, 10) : undefined,
        city: formState.city,
        state: formState.state,
        country: formState.country,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
      };

      const response = await userAPI.updateStudentProfile(updateData);
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        setShowEditModal(false);
        await fetchStudentProfile();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEmployerProfile = async () => {
    if (!formState.phone.trim() || !formState.businessName.trim() || !formState.businessType.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await userAPI.updateEmployerProfile(formState);
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        setShowEditModal(false);
        await fetchEmployerProfile();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeProfilePicture = async (image: { uri: string; type: string; name: string }) => {
    setIsUploadingAvatar(true);
    try {
      const result = await uploadAvatar(image.uri, image.type, image.name);
      if (result) {
        await updateUserAvatar(result);
        Alert.alert('Success', 'Profile picture updated successfully!');
        setShowPictureModal(false);
        user?.role === UserRole.STUDENT ? await fetchStudentProfile() : await fetchEmployerProfile();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const isLoading = user?.role === UserRole.STUDENT ? isLoadingStudent : isLoadingEmployer;
  const profile = user?.role === UserRole.STUDENT ? studentProfile : employerProfile;

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!user) return <Screen><Text style={styles.errorText}>User not found</Text></Screen>;

  const mergedProfile: any = {
    ...user,
    ...(profile || {}),
  };

  const profileCompletion = user?.role === UserRole.STUDENT
    ? calculateStudentProfileCompletion(mergedProfile as StudentProfile)
    : calculateEmployerProfileCompletion(mergedProfile as EmployerProfile);

  return (
    <Screen>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => setShowPictureModal(true)} activeOpacity={0.9}>
              <View style={styles.avatarWrapper}>
                <Avatar name={user.name} size="large" source={user.avatar} />
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={16} color={Colors.white} />
                </View>
              </View>
            </TouchableOpacity>
            
            <View style={styles.nameSection}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.badgeRow}>
                <Badge label={user.role.toUpperCase()} color="primary" />
                {user.isPhoneVerified && <Badge label="VERIFIED" color="success" />}
              </View>
            </View>
          </View>

          <View style={styles.completionContainer}>
            <ProfileCompletion percentage={profileCompletion.percentage} showMessage={true} />
          </View>
        </Card>

        {user.role === UserRole.STUDENT ? (
          <StudentData profile={mergedProfile} />
        ) : (
          <EmployerData profile={mergedProfile} />
        )}

        <Card style={styles.menuCard}>
          <Text style={styles.sectionTitle}>Account</Text>
          <MenuLink 
            icon="notifications" 
            label="Notifications" 
            onPress={() => router.push('/notifications')} 
          />
          <MenuLink 
            icon="star" 
            label="Reviews & Ratings" 
            onPress={() => router.push({ pathname: '/reviews', params: { userId: user.id } })} 
          />
          <MenuLink 
            icon="wallet" 
            label="Earnings & Wallet" 
            onPress={() => router.push('/wallet')} 
          />
        </Card>

        <View style={styles.actionButtons}>
          <Button title="Edit Profile" onPress={handleEditProfile} style={styles.editBtn} fullWidth />
          <Button title="Logout" variant="outline" onPress={handleLogout} style={styles.logoutBtn} fullWidth />
        </View>

        <View style={styles.spacing} />
      </ScrollView>

      <ProfilePictureModal
        visible={showPictureModal}
        currentImage={user.avatar}
        onClose={() => setShowPictureModal(false)}
        onImageSelected={handleChangeProfilePicture}
        isLoading={isUploadingAvatar}
      />

      <EditModal 
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        role={user.role}
        state={formState}
        setState={setFormState}
        onSave={user.role === UserRole.STUDENT ? handleSaveStudentProfile : handleSaveEmployerProfile}
        isLoading={isUpdating}
      />
    </Screen>
  );
}

const StudentData = ({ profile }: { profile: any }) => (
  <>
    <Card style={styles.infoCard}>
      <Text style={styles.sectionTitle}>Personal Stats</Text>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{profile.completedJobsCount || 0}</Text>
          <Text style={styles.statLab}>Completed</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>₹{(profile.walletBalance || 0).toLocaleString()}</Text>
          <Text style={styles.statLab}>Earnings</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{profile.skillScore || 0}%</Text>
          <Text style={styles.statLab}>Skill Score</Text>
        </View>
      </View>
    </Card>

    <Card style={styles.infoCard}>
      <Text style={styles.sectionTitle}>Information</Text>
      <InfoRow label="Phone" value={profile.phone} icon="call" />
      {profile.age && <InfoRow label="Age" value={`${profile.age} Years`} icon="calendar" />}
      <InfoRow 
        label="Location" 
        value={profile.city ? `${profile.city}, ${profile.state}` : 'Not Set'} 
        icon="location" 
      />
      {profile.bio && <View style={styles.divider} />}
      {profile.bio && <Text style={styles.bioTitle}>About Me</Text>}
      {profile.bio && <Text style={styles.bioText}>{profile.bio}</Text>}
    </Card>

    {profile.skills && profile.skills.length > 0 && (
      <Card style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.chipCloud}>
          {profile.skills.map((s: string, i: number) => <Badge key={i} label={s} color="accent" />)}
        </View>
      </Card>
    )}
  </>
);

const EmployerData = ({ profile }: { profile: any }) => (
  <>
    <Card style={styles.infoCard}>
      <Text style={styles.sectionTitle}>Business Stats</Text>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{profile.activeJobsCount || 0}</Text>
          <Text style={styles.statLab}>Active Jobs</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>₹{(profile.walletBalance || 0).toLocaleString()}</Text>
          <Text style={styles.statLab}>Wallet</Text>
        </View>
      </View>
    </Card>

    <Card style={styles.infoCard}>
      <Text style={styles.sectionTitle}>Business Info</Text>
      <InfoRow label="Name" value={profile.businessName} icon="business" />
      <InfoRow label="Type" value={profile.businessType} icon="briefcase" />
      <InfoRow 
        label="Location" 
        value={typeof profile.businessLocation === 'object' ? `${profile.businessLocation.city}, ${profile.businessLocation.state}` : profile.businessLocation} 
        icon="location" 
      />
      <InfoRow label="Contact" value={profile.phone} icon="call" />
    </Card>
  </>
);

const InfoRow = ({ label, value, icon }: { label: string; value: string; icon: any }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconBg}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const MenuLink = ({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.menuLink} onPress={onPress}>
    <View style={styles.menuLeft}>
      <View style={styles.menuIconBg}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
  </TouchableOpacity>
);

const EditModal = ({ visible, onClose, role, state, setState, onSave, isLoading }: any) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalForm}>
          <TextField label="Phone Number" value={state.phone} onChangeText={t => setState({...state, phone: t})} keyboardType="phone-pad" />
          
          {role === UserRole.STUDENT ? (
            <>
              <TextField label="Age" value={state.age} onChangeText={t => setState({...state, age: t})} keyboardType="numeric" />
              <View style={styles.formRow}>
                <View style={styles.flex1}><TextField label="City" value={state.city} onChangeText={t => setState({...state, city: t})} /></View>
                <View style={styles.flex1}><TextField label="State" value={state.state} onChangeText={t => setState({...state, state: t})} /></View>
              </View>
              <TextField label="Bio" value={state.bio} onChangeText={t => setState({...state, bio: t})} multiline />
              <TextField label="Skills (comma separated)" value={state.skills} onChangeText={t => setState({...state, skills: t})} multiline />
            </>
          ) : (
            <>
              <TextField label="Business Name" value={state.businessName} onChangeText={t => setState({...state, businessName: t})} />
              <TextField label="Business Type" value={state.businessType} onChangeText={t => setState({...state, businessType: t})} />
              <View style={styles.formRow}>
                <View style={styles.flex1}><TextField label="City" value={state.businessLocation.city} onChangeText={t => setState({...state, businessLocation: {...state.businessLocation, city: t}})} /></View>
                <View style={styles.flex1}><TextField label="State" value={state.businessLocation.state} onChangeText={t => setState({...state, businessLocation: {...state.businessLocation, state: t}})} /></View>
              </View>
            </>
          )}
          <View style={styles.modalActions}>
            <Button title="Save Changes" onPress={onSave} loading={isLoading} fullWidth />
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { textAlign: 'center', color: Colors.danger, marginTop: 40 },
  headerCard: { 
    backgroundColor: Colors.primary, 
    marginTop: -16, 
    borderBottomLeftRadius: 32, 
    borderBottomRightRadius: 32,
    padding: 24,
    marginBottom: 8
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarWrapper: { position: 'relative' },
  cameraBadge: { 
    position: 'absolute', 
    bottom: 2, 
    right: 2, 
    backgroundColor: Colors.secondary, 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white
  },
  nameSection: { marginLeft: 20, flex: 1 },
  userName: { fontSize: 24, fontWeight: '700' as any, color: Colors.white, marginBottom: 4 },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  completionContainer: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 16 },
  infoCard: { marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as any, color: Colors.text, marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '700' as any, color: Colors.primary, marginBottom: 4 },
  statLab: { fontSize: 12, color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoIconBg: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: 'rgba(79, 70, 229, 0.08)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 16
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: Colors.textLight, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600' as any, color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.gray[100], marginVertical: 16 },
  bioTitle: { fontSize: 14, fontWeight: '700' as any, color: Colors.text, marginBottom: 8 },
  bioText: { fontSize: 14, color: Colors.textLight, lineHeight: 22 },
  chipCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  menuCard: { marginTop: 4 },
  menuLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIconBg: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    backgroundColor: 'rgba(79, 70, 229, 0.06)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12
  },
  menuLabel: { fontSize: 15, fontWeight: '500' as any, color: Colors.text },
  actionButtons: { paddingHorizontal: 20, marginTop: 20, gap: 12 },
  editBtn: { borderRadius: 16 },
  logoutBtn: { borderRadius: 16, borderColor: Colors.danger },
  spacing: { height: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '90%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700' as any, color: Colors.text },
  modalForm: { flex: 1 },
  formRow: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  modalActions: { marginTop: 24, paddingBottom: 40 }
});
