import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {scaleFont, scaleHeight, scaleWidth} from '@css/scale';

const MEDIA_HEIGHT = scaleHeight(310);
const PHOTO_MAX_WIDTH = scaleWidth(220);
const VIDEO_DEFAULT_WIDTH = MEDIA_HEIGHT * (9 / 16);

interface Props {
  photoUri: string | null;
  hasVideo: boolean;
  videoThumbnailUri: string | null;
  photoAspectRatio: number | null;
  firstAdded: 'photo' | 'video' | null;
  showPhotoDelete: boolean;
  showVideoDelete: boolean;
  onPhotoPress: () => void;
  onVideoPress: () => void;
  onDeletePhoto: () => void;
  onDeleteVideo: () => void;
  onAddPhoto: () => void;
  onAddVideo: () => void;
}

export default function EditMediaSection({
  photoUri,
  hasVideo,
  videoThumbnailUri,
  photoAspectRatio,
  firstAdded,
  showPhotoDelete,
  showVideoDelete,
  onPhotoPress,
  onVideoPress,
  onDeletePhoto,
  onDeleteVideo,
  onAddPhoto,
  onAddVideo,
}: Props) {
  if (!firstAdded) return null;

  const photoDisplayStyle = (() => {
    if (!photoAspectRatio) return {width: scaleWidth(140), height: MEDIA_HEIGHT};
    const widthByHeight = MEDIA_HEIGHT * photoAspectRatio;
    if (widthByHeight <= PHOTO_MAX_WIDTH) {
      return {width: widthByHeight, height: MEDIA_HEIGHT};
    }
    return {width: PHOTO_MAX_WIDTH, height: PHOTO_MAX_WIDTH / photoAspectRatio};
  })();

  const videoDisplayStyle = photoUri ? photoDisplayStyle : {width: VIDEO_DEFAULT_WIDTH, height: MEDIA_HEIGHT};

  const PhotoItem = () =>
    photoUri ? (
      <TouchableOpacity
        style={[styles.mediaItem, photoDisplayStyle]}
        onPress={onPhotoPress}
        activeOpacity={1}>
        <Image source={{uri: photoUri}} style={styles.fill} resizeMode="cover" />
        {showPhotoDelete && (
          <View style={styles.deleteOverlay}>
            <TouchableOpacity style={styles.deleteBtn} onPress={onDeletePhoto}>
              <Image source={require('@images/flog/deleteIcon.png')} style={styles.deleteBtnIcon} />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    ) : null;

  const VideoItem = () => (
    <TouchableOpacity
      style={[styles.mediaItem, styles.videoBg, videoDisplayStyle]}
      onPress={onVideoPress}
      activeOpacity={1}>
      {videoThumbnailUri ? (
        <Image source={{uri: videoThumbnailUri}} style={styles.fill} resizeMode="cover" />
      ) : (
        <Text style={styles.videoIcon}>🎬</Text>
      )}
      {!showVideoDelete && (
        <View style={styles.playOverlay}>
          <View style={styles.playBtn}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>
      )}
      {showVideoDelete && (
        <View style={styles.deleteOverlay}>
          <TouchableOpacity style={styles.deleteBtn} onPress={onDeleteVideo}>
            <Image source={require('@images/flog/deleteIcon.png')} style={styles.deleteBtnIcon} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const AddPhotoBtn = () => (
    <View style={styles.addBtnWrap}>
      <TouchableOpacity style={styles.addBtn} onPress={onAddPhoto} activeOpacity={0.7}>
        <Text style={styles.addBtnText}>+</Text>
      </TouchableOpacity>
      <Text style={styles.addBtnDesc}>사진 추가</Text>
    </View>
  );

  const AddVideoBtn = () => (
    <View style={styles.addBtnWrap}>
      <TouchableOpacity style={styles.addBtn} onPress={onAddVideo} activeOpacity={0.7}>
        <Text style={styles.addBtnText}>+</Text>
      </TouchableOpacity>
      <Text style={styles.addBtnDesc}>동영상{'\n'}(20초 이내)</Text>
    </View>
  );

  // 가로 사진: 수직 레이아웃
  if (photoAspectRatio !== null && photoAspectRatio > 1 && photoUri) {
    const w = PHOTO_MAX_WIDTH;
    const h = w / photoAspectRatio;
    return (
      <View style={styles.landscapeContainer}>
        <TouchableOpacity
          style={[styles.mediaItem, {width: w, height: h}]}
          onPress={onPhotoPress}
          activeOpacity={1}>
          <Image source={{uri: photoUri}} style={styles.fill} resizeMode="cover" />
          {showPhotoDelete && (
            <View style={styles.deleteOverlay}>
              <TouchableOpacity style={styles.deleteBtn} onPress={onDeletePhoto}>
                <Image source={require('@images/flog/deleteIcon.png')} style={styles.deleteBtnIcon} />
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
        {hasVideo ? <VideoItem /> : <AddVideoBtn />}
      </View>
    );
  }

  // 세로: 가로 스크롤
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollRow}>
      {firstAdded === 'video' ? (
        <>
          <VideoItem />
          {photoUri ? <PhotoItem /> : <AddPhotoBtn />}
        </>
      ) : (
        <>
          <PhotoItem />
          {hasVideo ? <VideoItem /> : <AddVideoBtn />}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(12),
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(12),
  },
  landscapeContainer: {
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(12),
    gap: scaleHeight(12),
  },
  mediaItem: {
    borderRadius: scaleWidth(8),
    overflow: 'hidden',
  },
  videoBg: {
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {width: '100%', height: '100%'},
  deleteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: scaleWidth(52),
    height: scaleWidth(52),
    borderRadius: scaleWidth(26),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnIcon: {width: scaleWidth(24), height: scaleWidth(24), resizeMode: 'contain'},
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(20),
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {fontSize: scaleFont(18), color: '#111', marginLeft: scaleWidth(2)},
  videoIcon: {fontSize: scaleFont(30)},
  addBtnWrap: {alignItems: 'center', gap: scaleHeight(6)},
  addBtn: {
    width: scaleWidth(50),
    height: scaleWidth(50),
    borderRadius: scaleWidth(25),
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {fontSize: scaleFont(26), color: '#888', fontWeight: '300', lineHeight: scaleFont(30)},
  addBtnDesc: {fontSize: scaleFont(13), color: '#AAA', textAlign: 'center'},
});
