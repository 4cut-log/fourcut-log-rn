import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Video, {VideoRef} from 'react-native-video';
import {createThumbnail} from 'react-native-create-thumbnail';
import {scaleFont, scaleHeight, scaleWidth} from '@css/scale';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const MEDIA_HEIGHT = SCREEN_HEIGHT * 0.5;
const PHOTO_MAX_WIDTH = scaleWidth(260);
const CONTENT_PADDING = scaleWidth(20);
const LANDSCAPE_WIDTH = SCREEN_WIDTH - CONTENT_PADDING * 2;

interface Props {
  photoUrl?: string;
  videoUrl?: string;
}

export default function FlogMediaSection({photoUrl, videoUrl}: Props) {
  const [photoAspectRatio, setPhotoAspectRatio] = useState<number | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [mediaOverflows, setMediaOverflows] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerType, setViewerType] = useState<'photo' | 'video'>('photo');
  const [viewerVideoPaused, setViewerVideoPaused] = useState(false);
  const viewerVideoRef = useRef<VideoRef>(null);

  useEffect(() => {
    if (!videoUrl) return;
    const rawPath = videoUrl.startsWith('http') ? videoUrl : videoUrl.replace(/^file:\/\//, '');
    createThumbnail({url: rawPath, timeStamp: 0})
      .then(res => {
        const uri = res.path.startsWith('file://') ? res.path : `file://${res.path}`;
        setVideoThumbnail(uri);
      })
      .catch(() => {});
  }, [videoUrl]);

  const isLandscape = photoAspectRatio !== null && photoAspectRatio > 1;

  // 세로 사진용 (가로 스크롤 레이아웃)
  const photoDisplayStyle = (() => {
    if (!photoAspectRatio) return {width: scaleWidth(140), height: MEDIA_HEIGHT};
    const widthByHeight = MEDIA_HEIGHT * photoAspectRatio;
    if (widthByHeight <= PHOTO_MAX_WIDTH) {
      return {width: widthByHeight, height: MEDIA_HEIGHT};
    }
    return {width: PHOTO_MAX_WIDTH, height: PHOTO_MAX_WIDTH / photoAspectRatio};
  })();

  // 세로 사진 레이아웃에서 비디오 컨테이너 = 사진과 동일한 크기
  // (썸네일 비율로 맞추면 cover 크롭이 안 돼 검정 여백이 그대로 보임)
  const videoDisplayStyle = photoDisplayStyle;

  // 가로 사진용 (2줄 레이아웃)
  const landscapePhotoHeight = photoAspectRatio
    ? LANDSCAPE_WIDTH / photoAspectRatio
    : LANDSCAPE_WIDTH * (3 / 4);
  // 비디오는 사진과 동일한 높이로 맞추고 cover로 크롭 (레터박스 여백 최소화)
  const landscapeVideoHeight = landscapePhotoHeight;

  const openViewer = (type: 'photo' | 'video') => {
    setViewerType(type);
    setViewerVideoPaused(false);
    setViewerVisible(true);
  };

  const closeViewer = () => {
    setViewerVisible(false);
    setViewerVideoPaused(true);
  };

  return (
    <>
      {isLandscape ? (
        /* 가로 사진: 사진 위, 동영상 아래 2줄 레이아웃 */
        <View style={styles.landscapeContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => openViewer('photo')}>
            <Image
              source={{uri: photoUrl}}
              style={[styles.photo, {width: LANDSCAPE_WIDTH, height: landscapePhotoHeight}]}
              resizeMode="cover"
              onLoad={e => {
                const {width, height} = e.nativeEvent.source;
                if (width && height) setPhotoAspectRatio(width / height);
              }}
            />
          </TouchableOpacity>
          {videoUrl && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.videoWrapper, {width: LANDSCAPE_WIDTH, height: landscapeVideoHeight}]}
              onPress={() => openViewer('video')}>
              {videoThumbnail ? (
                <Image
                  source={{uri: videoThumbnail}}
                  style={styles.fill}
                  resizeMode="cover"
                />
              ) : null}
              <View style={styles.playOverlay}>
                <View style={styles.playBtn}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* 세로 사진 (또는 사진 없음): 가로 스크롤 레이아웃 */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onContentSizeChange={w => setMediaOverflows(w > SCREEN_WIDTH)}
          contentContainerStyle={[
            styles.mediaRow,
            !mediaOverflows && styles.mediaRowCenter,
          ]}>
          {photoUrl ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => openViewer('photo')}>
              <Image
                source={{uri: photoUrl}}
                style={[styles.photo, photoDisplayStyle]}
                resizeMode="cover"
                onLoad={e => {
                  const {width, height} = e.nativeEvent.source;
                  if (width && height) setPhotoAspectRatio(width / height);
                }}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>🖼️</Text>
            </View>
          )}

          {videoUrl && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.videoWrapper, videoDisplayStyle]}
              onPress={() => openViewer('video')}>
              {videoThumbnail ? (
                <Image
                  source={{uri: videoThumbnail}}
                  style={styles.fill}
                  resizeMode="cover"
                />
              ) : null}
              <View style={styles.playOverlay}>
                <View style={styles.playBtn}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* 전체화면 뷰어 */}
      <Modal
        visible={viewerVisible}
        transparent
        animationType="fade"
        onRequestClose={closeViewer}>
        <View style={styles.viewerOverlay}>
          <TouchableOpacity style={styles.viewerClose} onPress={closeViewer}>
            <Text style={styles.viewerCloseText}>✕</Text>
          </TouchableOpacity>

          {viewerType === 'photo' && photoUrl ? (
            <Image
              source={{uri: photoUrl}}
              style={styles.viewerImage}
              resizeMode="contain"
            />
          ) : viewerType === 'video' && videoUrl ? (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.viewerVideoWrapper}
              onPress={() => setViewerVideoPaused(p => !p)}>
              <Video
                ref={viewerVideoRef}
                source={{uri: videoUrl}}
                style={styles.viewerVideo}
                paused={viewerVideoPaused}
                resizeMode="contain"
                repeat
              />
              {viewerVideoPaused && (
                <View style={styles.playOverlay}>
                  <View style={styles.viewerPlayBtn}>
                    <Text style={styles.viewerPlayIcon}>▶</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  landscapeContainer: {
    paddingHorizontal: CONTENT_PADDING,
    paddingVertical: scaleHeight(16),
    gap: scaleHeight(12),
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(12),
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(16),
  },
  mediaRowCenter: {
    minWidth: SCREEN_WIDTH,
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(20),
  },
  photo: {
    borderRadius: scaleWidth(6),
    overflow: 'hidden',
  },
  photoPlaceholder: {
    width: scaleWidth(140),
    height: MEDIA_HEIGHT,
    borderRadius: scaleWidth(6),
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: scaleFont(38),
  },
  videoWrapper: {
    borderRadius: scaleWidth(8),
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: scaleWidth(44),
    height: scaleWidth(44),
    borderRadius: scaleWidth(22),
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: scaleFont(20),
    color: '#111',
    marginLeft: scaleWidth(3),
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerClose: {
    position: 'absolute',
    top: scaleHeight(52),
    right: scaleWidth(20),
    zIndex: 10,
    width: scaleWidth(36),
    height: scaleWidth(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCloseText: {
    color: '#fff',
    fontSize: scaleFont(22),
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  viewerVideoWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerVideo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  viewerPlayBtn: {
    width: scaleWidth(64),
    height: scaleWidth(64),
    borderRadius: scaleWidth(32),
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerPlayIcon: {
    fontSize: scaleFont(28),
    color: '#111',
    marginLeft: scaleWidth(4),
  },
});
