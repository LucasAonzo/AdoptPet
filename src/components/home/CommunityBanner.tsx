import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface CommunityBannerProps {
  // The component doesn't currently accept any props, but we'll define the interface for future extensibility
}

interface BannerStyles {
  bannerContainer: ViewStyle;
  bannerContent: ViewStyle;
  bannerTitle: TextStyle;
  joinButton: ViewStyle;
  joinButtonText: TextStyle;
  bannerImage: ImageStyle;
}

const CommunityBanner: React.FC<CommunityBannerProps> = () => {
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>Join our animal lovers Community</Text>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join Now</Text>
        </TouchableOpacity>
      </View>
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
        style={styles.bannerImage}
      />
    </View>
  );
};

const styles = StyleSheet.create<BannerStyles>({
  bannerContainer: {
    flexDirection: 'row',
    backgroundColor: '#8e74ae',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 20,
    height: 150,
    marginBottom: 25,
  },
  bannerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  bannerImage: {
    width: '50%',
    height: '100%',
  },
});

export default CommunityBanner; 