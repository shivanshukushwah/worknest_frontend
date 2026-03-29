import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@components/index';

interface ProfilePictureModalProps {
  visible: boolean;
  currentImage?: string;
  onClose: () => void;
  onImageSelected: (image: { uri: string; type: string; name: string }) => Promise<void>;
  isLoading?: boolean;
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  visible,
  currentImage,
  onClose,
  onImageSelected,
  isLoading = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(currentImage);
  const [isSelectingImage, setIsSelectingImage] = useState(false);

  const handlePickFromGallery = async () => {
    try {
      setIsSelectingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        await onImageSelected({
          uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    } finally {
      setIsSelectingImage(false);
    }
  };

  const handlePickFromCamera = async () => {
    try {
      setIsSelectingImage(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        await onImageSelected({
          uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsSelectingImage(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Remove',
          onPress: () => {
            setSelectedImage(undefined);
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Profile Picture</Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading || isSelectingImage}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Image Preview */}
          <View style={styles.previewContainer}>
            {selectedImage ? (
              <>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.previewImage}
                />
                <View style={styles.successBadge}>
                  <Text style={styles.successText}>✓</Text>
                </View>
              </>
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>📷</Text>
                <Text style={styles.placeholderLabel}>No Image Selected</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cameraButton]}
              onPress={handlePickFromCamera}
              disabled={isLoading || isSelectingImage}
            >
              {isSelectingImage ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.actionIcon}>📷</Text>
                  <Text style={styles.actionText}>Take Photo</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.galleryButton]}
              onPress={handlePickFromGallery}
              disabled={isLoading || isSelectingImage}
            >
              {isSelectingImage ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.actionIcon}>🖼️</Text>
                  <Text style={styles.actionText}>Choose from Gallery</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Remove Photo Button */}
          {selectedImage && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemovePhoto}
              disabled={isLoading || isSelectingImage}
            >
              <Text style={styles.removeText}>Remove Photo</Text>
            </TouchableOpacity>
          )}

          {/* Footer Buttons */}
          <View style={styles.footerButtons}>
            <Button
              title={isLoading ? 'Saving...' : 'Done'}
              onPress={onClose}
              fullWidth
              disabled={isLoading || isSelectingImage}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    fontSize: 24,
    color: '#666666',
    fontWeight: 'bold',
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F0F0F0',
  },
  successBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderLabel: {
    fontSize: 12,
    color: '#999999',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#007AFF',
  },
  galleryButton: {
    backgroundColor: '#5AC8FA',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  removeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  removeText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  footerButtons: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
});

export default ProfilePictureModal;
