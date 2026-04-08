import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ConfirmModal from '@/components/common/ConfirmModal';
import ToastAlert from '@/components/common/ToastAlert';
import EditMediaSection from '@/components/AddEdit/EditMediaSection';
import EditFormSection from '@/components/AddEdit/EditFormSection';
import CalendarPicker from '@/components/common/CalendarPicker';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ImageCropPicker from 'react-native-image-crop-picker';
import {createThumbnail} from 'react-native-create-thumbnail';
import {RootStackParamList} from '@type/navigation';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';
import {_useFetch} from '@hooks/useFetch';
import {FlogResponse, FlogUpdateRequest, updateFlog} from '@api/flog';
import {getPresignedUrl} from '@api/s3';
import {useQueryClient} from '@tanstack/react-query';

type Props = NativeStackScreenProps<RootStackParamList, 'EditLog'>;

const TAG_COLOR_PALETTE = [
  '#FAE3A0',
  '#F9C8CF',
  '#D8CCEC',
  '#B8DCF0',
  '#C8EDD0',
  '#F9D8B8',
];

export default function EditLogScreen({navigation, route}: Props) {
  const {flogId} = route.params;
  const queryClient = useQueryClient();

  const {data, isLoading} = _useFetch<FlogResponse>(`/flogs/${flogId}`, [
    'flog',
    flogId,
  ]);
  const flog = data?.data;

  // 폼 상태
  const [date, setDate] = useState(new Date());
  const [tags, setTags] = useState<{tagName: string; color: string}[]>([]);
  const [newTagText, setNewTagText] = useState('');
  const [tagInputFocused, setTagInputFocused] = useState(false);
  const [where, setWhere] = useState('');
  const [memo, setMemo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 사진 상태
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [photoAsset, setPhotoAsset] = useState<{
    uri: string;
    fileName: string;
    type: string;
  } | null>(null);
  const [thumbnailAsset, setThumbnailAsset] = useState<{
    uri: string;
    fileName: string;
    type: string;
  } | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const handleMemoFocus = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({animated: true}), 200);
  }, []);

  const thumbnailAssetRef = useRef<{
    uri: string;
    fileName: string;
    type: string;
  } | null>(null);
  const [photoAspectRatio, setPhotoAspectRatio] = useState<number | null>(null);
  const [savedCropRect, setSavedCropRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [showPhotoDelete, setShowPhotoDelete] = useState(false);

  // 동영상 상태
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [videoAsset, setVideoAsset] = useState<{
    uri: string;
    fileName: string;
    type: string;
  } | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [showVideoDelete, setShowVideoDelete] = useState(false);

  // 미디어 순서
  const [firstAdded, setFirstAdded] = useState<'photo' | 'video' | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);

  const PHOTO_MAX_WIDTH = scaleWidth(220);
  const PHOTO_MAX_HEIGHT = scaleHeight(310);
  const photoPreviewStyle = (() => {
    if (!photoAspectRatio)
      return {width: scaleWidth(140), height: PHOTO_MAX_HEIGHT};
    const widthByHeight = PHOTO_MAX_HEIGHT * photoAspectRatio;
    if (widthByHeight <= PHOTO_MAX_WIDTH) {
      return {width: widthByHeight, height: PHOTO_MAX_HEIGHT};
    }
    return {width: PHOTO_MAX_WIDTH, height: PHOTO_MAX_WIDTH / photoAspectRatio};
  })();

  // 기존 데이터 pre-fill
  useEffect(() => {
    if (!flog) return;
    setDate(new Date(flog.date));
    setTags(flog.tags.map(t => ({tagName: t.tagName, color: t.color})));
    setWhere(flog.location ?? '');
    setMemo(flog.memoCtt ?? '');
    setExistingPhotoUrl(flog.photoUrl ?? null);
    setExistingVideoUrl(flog.videoUrl ?? null);
    if (flog.photoUrl || flog.videoUrl) {
      setFirstAdded(flog.photoUrl ? 'photo' : 'video');
    }
    if (flog.videoUrl) {
      createThumbnail({url: flog.videoUrl, timeStamp: 0})
        .then(res => setVideoThumbnail(toUri(res.path)))
        .catch(() => setVideoThumbnail(null));
    }
    if (flog.photoUrl) {
      Image.getSize(flog.photoUrl, (w, h) => {
        if (w && h) setPhotoAspectRatio(w / h);
      });
    }
  }, [flog]);

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const toUri = (path: string) =>
    path.startsWith('file://') ? path : `file://${path}`;

  const cropperBase = {
    cropperToolbarColor: '#000000',
    cropperToolbarWidgetColor: '#FFFFFF',
    cropperStatusBarColor: '#000000',
    cropperActiveWidgetColor: '#FFFFFF',
    freeStyleCropEnabled: true,
  };

  const openCropperAfterPick = (
    originalPath: string,
    fileName: string,
    mime: string,
    originalWidth?: number,
    originalHeight?: number,
  ) => {
    const originalUri = toUri(originalPath);
    const original = {uri: originalUri, fileName, type: mime};
    ImageCropPicker.openCropper({
      path: originalPath,
      ...cropperBase,
      width: 300,
      height: 400,
      cropperToolbarTitle: '썸네일 영역을 설정해 주세요',
      cropperSubtitleTitle: '3:4 비율로 설정하면 캘린더 썸네일에 딱 맞아요!',
    })
      .then(cropped => {
        setPhotoAsset(original);
        setExistingPhotoUrl(null);
        setShowPhotoDelete(false);
        if (originalWidth && originalHeight)
          setPhotoAspectRatio(originalWidth / originalHeight);
        if (!firstAdded) setFirstAdded('photo');
        if (cropped.cropRect) setSavedCropRect(cropped.cropRect);
        const asset = {
          uri: toUri(cropped.path),
          fileName: cropped.filename || fileName,
          type: cropped.mime || mime,
        };
        thumbnailAssetRef.current = asset;
        setThumbnailAsset(asset);
      })
      .catch(() => {});
  };

  // 썸네일 재설정
  const handleReCrop = () => {
    const sourcePath = photoAsset?.uri ?? existingPhotoUrl;
    if (!sourcePath) return;
    ImageCropPicker.openCropper({
      path: sourcePath,
      ...cropperBase,
      width: 300,
      height: 400,
      ...(savedCropRect ? {cropRect: savedCropRect} : {}),
      cropperToolbarTitle: '썸네일 영역을 설정해 주세요',
      cropperSubtitleTitle: '3:4 비율로 설정하면 캘린더 썸네일에 딱 맞아요',
    })
      .then(cropped => {
        if (cropped.cropRect) setSavedCropRect(cropped.cropRect);
        const asset = {
          uri: toUri(cropped.path),
          fileName:
            cropped.filename || (photoAsset?.fileName ?? 'thumbnail.jpg'),
          type: cropped.mime || (photoAsset?.type ?? 'image/jpeg'),
        };
        thumbnailAssetRef.current = asset;
        setThumbnailAsset(asset);
      })
      .catch(() => {});
  };

  const pickVideo = (uri: string, fileName: string, type: string) => {
    setVideoAsset({uri, fileName, type});
    setExistingVideoUrl(null);
    if (!firstAdded) setFirstAdded('video');
    createThumbnail({url: uri, timeStamp: 0})
      .then(res => setVideoThumbnail(toUri(res.path)))
      .catch(err => {
        console.warn('[createThumbnail] error:', err);
        setVideoThumbnail(null);
      });
  };

  const handlePickFromGallery = () => {
    ImageCropPicker.openPicker({mediaType: 'any', cropping: false})
      .then(media => {
        if (media.mime?.startsWith('video/')) {
          if (videoAsset || existingVideoUrl) {
            setShowDuplicateAlert(true);
            return;
          }
          if (media.duration && media.duration > 20000) return;
          pickVideo(
            toUri(media.path),
            media.filename || 'video.mp4',
            media.mime || 'video/mp4',
          );
        } else {
          if (photoAsset || existingPhotoUrl) {
            setShowDuplicateAlert(true);
            return;
          }
          openCropperAfterPick(
            media.path,
            media.filename || 'photo.jpg',
            media.mime || 'image/jpeg',
            media.width,
            media.height,
          );
        }
      })
      .catch(() => {});
  };

  const handlePickVideo = () => {
    if (videoAsset || existingVideoUrl) {
      setShowDuplicateAlert(true);
      return;
    }
    ImageCropPicker.openPicker({mediaType: 'video', cropping: false})
      .then(media => {
        if (media.duration && media.duration > 20000) return;
        pickVideo(
          toUri(media.path),
          media.filename || 'video.mp4',
          media.mime || 'video/mp4',
        );
      })
      .catch(() => {});
  };

  // 현재 보여줄 사진/동영상 URI
  const displayPhotoUri = photoAsset?.uri ?? existingPhotoUrl;
  const displayVideoUri =
    videoThumbnail ?? (existingVideoUrl ? existingVideoUrl : null);
  const hasVideo = !!(videoAsset || existingVideoUrl);
  const hasMedia = !!(displayPhotoUri || hasVideo);

  const handleBack = () => setShowBackModal(true);

  const goBack = () => {
    navigation.canGoBack()
      ? navigation.goBack()
      : navigation.navigate('BottomTab', {screen: 'CalendarTab'});
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      let photoUrl: string | undefined;
      let thumbnailUrl: string | undefined;

      if (photoAsset) {
        const presignedRes = await getPresignedUrl(
          photoAsset.fileName,
          photoAsset.type,
        );
        const fileBlob = await (await fetch(photoAsset.uri)).blob();
        await fetch(presignedRes.data.presignedUrl, {
          method: 'PUT',
          headers: {'Content-Type': photoAsset.type},
          body: fileBlob,
        });
        photoUrl = presignedRes.data.fileUrl;

        const thumb = thumbnailAssetRef.current ?? photoAsset;
        const thumbPresignedRes = await getPresignedUrl(
          thumb.fileName,
          thumb.type,
        );
        const thumbBlob = await (await fetch(thumb.uri)).blob();
        await fetch(thumbPresignedRes.data.presignedUrl, {
          method: 'PUT',
          headers: {'Content-Type': thumb.type},
          body: thumbBlob,
        });
        thumbnailUrl = thumbPresignedRes.data.fileUrl;
      } else if (thumbnailAsset) {
        // 기존 사진 유지 + 썸네일만 교체
        const thumb = thumbnailAssetRef.current ?? thumbnailAsset;
        const thumbPresignedRes = await getPresignedUrl(
          thumb.fileName,
          thumb.type,
        );
        const thumbBlob = await (await fetch(thumb.uri)).blob();
        await fetch(thumbPresignedRes.data.presignedUrl, {
          method: 'PUT',
          headers: {'Content-Type': thumb.type},
          body: thumbBlob,
        });
        photoUrl = existingPhotoUrl ?? undefined;
        thumbnailUrl = thumbPresignedRes.data.fileUrl;
      }

      let videoUrl: string | undefined;
      if (videoAsset) {
        const videoPresignedRes = await getPresignedUrl(
          videoAsset.fileName,
          videoAsset.type,
        );
        const videoBlob = await (await fetch(videoAsset.uri)).blob();
        await fetch(videoPresignedRes.data.presignedUrl, {
          method: 'PUT',
          headers: {'Content-Type': videoAsset.type},
          body: videoBlob,
        });
        videoUrl = videoPresignedRes.data.fileUrl;
      }

      const effectiveVideoUrl = videoUrl ?? existingVideoUrl ?? undefined;
      const body: FlogUpdateRequest = {
        ...(photoUrl ? {photoUrl, thumbnailUrl} : {}),
        ...(effectiveVideoUrl ? {videoUrl: effectiveVideoUrl} : {}),
        date: formatDate(date),
        location: where,
        memoCtt: memo,
        tags: tags.map(t => ({tagName: t.tagName, color: t.color})),
      };

      await updateFlog(flogId, body);

      const yearMonth = formatDate(date).substring(0, 7);
      queryClient.invalidateQueries({queryKey: ['calendar', yearMonth]});
      queryClient.invalidateQueries({queryKey: ['flog', flogId]});
      queryClient.invalidateQueries({queryKey: ['tags']});

      navigation.goBack();
    } catch (e: any) {
      Alert.alert(
        '수정 실패',
        e?.response?.data?.message ?? '다시 시도해 주세요.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={{flex: 1}} color="#111" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Image
            source={require('@images/common/backIcon.png')}
            style={styles.backIconImg}
          />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Image
            source={require('@images/flog/cameraIcon.png')}
            style={styles.headerTitleIcon}
          />
          <Text style={styles.headerTitle}>네컷로그 수정</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.flex}>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            contentInset={{bottom: 80}}>
            {/* 미디어 업로드 영역 */}
            <View style={styles.mediaSection}>
              {firstAdded && (
                <Text style={styles.mediaGuide}>
                  선택한 사진을 터치하면 삭제할 수 있어요!
                </Text>
              )}
              {firstAdded ? (
                <EditMediaSection
                  photoUri={displayPhotoUri ?? null}
                  hasVideo={hasVideo}
                  videoThumbnailUri={videoThumbnail}
                  photoAspectRatio={photoAspectRatio}
                  firstAdded={firstAdded}
                  showPhotoDelete={showPhotoDelete}
                  showVideoDelete={showVideoDelete}
                  onPhotoPress={() => setShowPhotoDelete(v => !v)}
                  onVideoPress={() => setShowVideoDelete(v => !v)}
                  onDeletePhoto={() => {
                    setPhotoAsset(null);
                    setThumbnailAsset(null);
                    thumbnailAssetRef.current = null;
                    setExistingPhotoUrl(null);
                    setPhotoAspectRatio(null);
                    setSavedCropRect(null);
                    setShowPhotoDelete(false);
                    setFirstAdded(hasVideo ? 'video' : null);
                  }}
                  onDeleteVideo={() => {
                    setVideoAsset(null);
                    setVideoThumbnail(null);
                    setExistingVideoUrl(null);
                    setShowVideoDelete(false);
                    if (!displayPhotoUri) setFirstAdded(null);
                  }}
                  onAddPhoto={handlePickFromGallery}
                  onAddVideo={handlePickVideo}
                />
              ) : (
                <TouchableOpacity
                  style={styles.mediaBtn}
                  onPress={handlePickFromGallery}
                  activeOpacity={0.7}>
                  <Image
                    source={require('@images/flog/photosIcon.png')}
                    style={styles.mediaBtnIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.mediaBtnText}>사진 1장은 필수!</Text>
                  <Text style={styles.mediaBtnText}>
                    추가로 동영상 1개까지 가능해요.
                  </Text>
                </TouchableOpacity>
              )}

              {/* 썸네일 재설정 툴팁 버튼 — 사진이 있으면 항상 표시 */}
              {!!displayPhotoUri && (
                <View style={styles.thumbnailTooltipWrap}>
                  <TouchableOpacity
                    style={styles.thumbnailTooltipBtn}
                    onPress={handleReCrop}
                    activeOpacity={0.7}>
                    <Text style={styles.thumbnailTooltipText}>
                      캘린더 썸네일 미리보기
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.thumbnailTooltipHint}>
                    캘린더 크기에 맞게 자동 조정되어 선택 영역과 다를 수 있어요.
                  </Text>
                </View>
              )}
            </View>

            {/* 폼 */}
            <EditFormSection
              dateText={formatDate(date)}
              onDatePress={() => setShowDatePicker(true)}
              withContent={
                <View style={styles.tagContainer}>
                  {tags.map((tag, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.tagChip, {backgroundColor: tag.color}]}
                      onPress={() =>
                        setTags(prev => prev.filter((_, idx) => idx !== i))
                      }
                      activeOpacity={0.7}>
                      <Text style={styles.tagChipText}>{tag.tagName}</Text>
                    </TouchableOpacity>
                  ))}
                  <TextInput
                    style={styles.tagInput}
                    value={newTagText}
                    onChangeText={setNewTagText}
                    placeholder={
                      tagInputFocused
                        ? ''
                        : tags.length === 0
                        ? '태그를 입력하세요'
                        : '+'
                    }
                    placeholderTextColor="#C0C0C0"
                    returnKeyType="done"
                    blurOnSubmit={false}
                    onFocus={() => setTagInputFocused(true)}
                    onBlur={() => setTagInputFocused(false)}
                    onSubmitEditing={() => {
                      const trimmed = newTagText.trim();
                      if (trimmed) {
                        const color =
                          TAG_COLOR_PALETTE[
                            tags.length % TAG_COLOR_PALETTE.length
                          ];
                        setTags(prev => [...prev, {tagName: trimmed, color}]);
                        setNewTagText('');
                      }
                      Keyboard.dismiss();
                    }}
                    onKeyPress={({nativeEvent}) => {
                      if (
                        nativeEvent.key === 'Backspace' &&
                        newTagText === ''
                      ) {
                        setTags(prev => prev.slice(0, -1));
                      }
                    }}
                  />
                </View>
              }
              where={where}
              onWhereChange={setWhere}
              memo={memo}
              onMemoChange={setMemo}
              onMemoFocus={handleMemoFocus}
            />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, isUploading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>수정 완료!</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 날짜 선택 모달 */}
      <Modal transparent visible={showDatePicker} animationType="slide">
        <View style={styles.dateModalOverlay}>
          <View style={styles.dateModalBox}>
            <View style={styles.dateModalHeader}>
              <Text style={styles.dateModalTitle}>날짜 선택</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.dateModalDone}>완료</Text>
              </TouchableOpacity>
            </View>
            <CalendarPicker
              current={formatDate(date)}
              maxDate={formatDate(new Date())}
              selectedDate={formatDate(date)}
              onDayPress={dateString => {
                setDate(new Date(dateString));
                setShowDatePicker(false);
              }}
            />
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={showBackModal}
        title="수정을 취소하고 뒤로 가시겠어요?"
        confirmText="뒤로가기"
        cancelText="취소"
        onConfirm={() => {
          setShowBackModal(false);
          goBack();
        }}
        onCancel={() => setShowBackModal(false)}
      />

      <ToastAlert
        visible={showDuplicateAlert}
        message={`사진과 동영상은 각각 1개만\n업로드 가능해요!`}
        onHide={() => setShowDuplicateAlert(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  backBtn: {width: scaleWidth(40), alignItems: 'center'},
  backIconImg: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    resizeMode: 'contain',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(6),
  },
  headerTitleIcon: {
    width: scaleWidth(20),
    height: scaleWidth(20),
    resizeMode: 'contain',
    marginBottom: scaleHeight(2),
  },
  headerTitle: {
    ...textStyle({fontSize: scaleFont(19), fontWeight: '600', color: '#111'}),
  },
  flex: {flex: 1},
  scroll: {flex: 1},
  scrollContent: {paddingBottom: scaleHeight(24)},

  // 미디어 영역
  mediaSection: {
    margin: scaleWidth(20),
    gap: scaleHeight(12),
  },
  mediaGuide: {
    ...textStyle({fontSize: scaleFont(15), color: '#888'}),
    textAlign: 'center',
    marginTop: scaleHeight(5),
  },
  thumbnailTooltipWrap: {
    alignItems: 'center',
    gap: scaleHeight(6),
  },
  thumbnailTooltipBtn: {
    backgroundColor: '#F0F0F0',
    borderRadius: scaleWidth(20),
    paddingHorizontal: scaleWidth(14),
    paddingVertical: scaleHeight(7),
    marginTop: scaleHeight(10),
  },
  thumbnailTooltipText: {
    ...textStyle({fontSize: scaleFont(15), color: '#555', fontWeight: '500'}),
  },
  thumbnailTooltipHint: {
    ...textStyle({fontSize: scaleFont(13), color: '#AAAAAA'}),
    textAlign: 'center',
  },
  mediaBtn: {
    backgroundColor: '#F5F5F5',
    borderRadius: scaleWidth(12),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleHeight(40),
  },
  mediaBtnIcon: {
    width: scaleWidth(28),
    height: scaleWidth(28),
    marginBottom: scaleHeight(18),
  },
  mediaBtnText: {
    ...textStyle({fontSize: scaleFont(14), color: '#555'}),
    marginBottom: scaleHeight(5),
  },
  mediaPreviewRow: {
    flexDirection: 'row',
    gap: scaleWidth(12),
    alignItems: 'center',
  },
  previewBox: {
    position: 'relative',
    borderRadius: scaleWidth(8),
    overflow: 'hidden',
  },
  previewImage: {width: '100%', height: '100%'},
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
  deleteBtnIcon: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    resizeMode: 'contain',
  },
  videoAddBtn: {
    width: scaleWidth(50),
    aspectRatio: 1,
    borderRadius: scaleWidth(36),
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  videoAddBtnText: {
    ...textStyle({fontSize: scaleFont(24), color: '#888', fontWeight: '300'}),
  },
  videoAddBtnDesc: {
    ...textStyle({fontSize: scaleFont(12), color: '#AAA'}),
    textAlign: 'center',
    marginTop: scaleWidth(5),
  },
  videoPreviewBox: {
    width: scaleWidth(100),
    height: scaleHeight(310),
    borderRadius: scaleWidth(8),
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  videoThumbnailImage: {
    ...StyleSheet.absoluteFillObject,
  },
  videoPlayOverlay: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: scaleWidth(16),
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayIcon: {
    fontSize: scaleFont(16),
    color: '#fff',
    marginLeft: scaleWidth(2),
  },
  videoIcon: {fontSize: scaleFont(30)},

  // 폼
  form: {marginHorizontal: scaleWidth(20)},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleHeight(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  rowLast: {borderBottomWidth: 0},
  labelWrap: {
    flexDirection: 'row',
    width: scaleWidth(64),
    alignItems: 'center',
  },
  label: {
    ...textStyle({fontSize: scaleFont(17), fontWeight: '500', color: '#111'}),
  },
  required: {
    ...textStyle({
      fontSize: scaleFont(17),
      fontWeight: '500',
      color: '#E0494B',
    }),
  },
  inputWrap: {flex: 1},
  input: {...textStyle({fontSize: scaleFont(17), color: '#333'}), padding: 0},
  inputText: {...textStyle({fontSize: scaleFont(17), color: '#333'})},
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaleWidth(6),
    alignItems: 'center',
    paddingVertical: scaleHeight(2),
  },
  tagChip: {
    borderRadius: scaleWidth(20),
    paddingHorizontal: scaleWidth(18),
    paddingVertical: scaleHeight(10),
    position: 'relative',
  },
  tagChipText: {
    ...textStyle({fontSize: scaleFont(16), color: '#333'}),
  },
  tagInput: {
    ...textStyle({fontSize: scaleFont(16), color: '#333'}),
    padding: 0,
    minWidth: scaleWidth(40),
  },

  // 하단 버튼
  footer: {
    paddingHorizontal: scaleWidth(20),
    paddingBottom: Platform.OS === 'android' ? scaleHeight(20) : scaleHeight(8),
    paddingTop: scaleHeight(12),
  },
  submitBtn: {
    backgroundColor: '#111',
    borderRadius: scaleWidth(50),
    paddingVertical: scaleHeight(16),
    alignItems: 'center',
  },
  submitBtnDisabled: {backgroundColor: '#BDBDBD'},
  submitText: {
    ...textStyle({fontSize: scaleFont(18), fontWeight: '600', color: '#fff'}),
  },

  // 날짜 피커 모달
  dateModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dateModalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: scaleWidth(16),
    borderTopRightRadius: scaleWidth(16),
    height: scaleHeight(430),
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  dateModalTitle: {
    ...textStyle({fontSize: scaleFont(18), fontWeight: '600', color: '#111'}),
  },
  dateModalDone: {
    ...textStyle({
      fontSize: scaleFont(18),
      fontWeight: '500',
      color: '#4A90E2',
    }),
  },
});
