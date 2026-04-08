import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import CalendarPicker from '@/components/common/CalendarPicker';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import {createThumbnail} from 'react-native-create-thumbnail';
import {RootStackParamList} from '@type/navigation';
import {scaleFont, scaleHeight, scaleWidth, textStyle} from '@css/scale';
import {_useFetchMuteParam} from '@hooks/useFetch';
import {FlogRequest, FlogResponse} from '@api/flog';
import {getPresignedUrl} from '@api/s3';
import {useQueryClient} from '@tanstack/react-query';
import ConfirmModal from '@/components/common/ConfirmModal';
import ToastAlert from '@/components/common/ToastAlert';

type Props = NativeStackScreenProps<RootStackParamList, 'AddLog'>;

const today = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function AddLogScreen({navigation}: Props) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [withText, setWithText] = useState('');
  const [where, setWhere] = useState('');
  const [memo, setMemo] = useState('');
  const [photoAsset, setPhotoAsset] = useState<{
    uri: string; // 원본 URI (미리보기 + PHOTO_URL)
    fileName: string;
    type: string;
  } | null>(null);
  const [thumbnailAsset, setThumbnailAsset] = useState<{
    uri: string; // 크롭본 URI (THUMBNAIL_URL)
    fileName: string;
    type: string;
  } | null>(null);
  // useRef로 최신 thumbnailAsset을 동기적으로 추적 — handleSubmit의 stale closure 방지
  const thumbnailAssetRef = useRef<{
    uri: string;
    fileName: string;
    type: string;
  } | null>(null);
  const [videoAsset, setVideoAsset] = useState<{
    uri: string;
    fileName: string;
    type: string;
  } | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [firstAdded, setFirstAdded] = useState<'photo' | 'video' | null>(null);
  const [photoAspectRatio, setPhotoAspectRatio] = useState<number | null>(null);
  const [showPhotoDelete, setShowPhotoDelete] = useState(false);

  const PHOTO_MAX_WIDTH = scaleWidth(220);
  const PHOTO_MAX_HEIGHT = scaleHeight(200);
  const photoPreviewStyle = (() => {
    if (!photoAspectRatio)
      return {width: scaleWidth(140), height: PHOTO_MAX_HEIGHT};
    const widthByHeight = PHOTO_MAX_HEIGHT * photoAspectRatio;
    if (widthByHeight <= PHOTO_MAX_WIDTH) {
      return {width: widthByHeight, height: PHOTO_MAX_HEIGHT};
    }
    return {width: PHOTO_MAX_WIDTH, height: PHOTO_MAX_WIDTH / photoAspectRatio};
  })();
  const [showVideoDelete, setShowVideoDelete] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // 팝업 상태
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);

  const {mutate, isPending} = _useFetchMuteParam<FlogResponse, FlogRequest>(
    'post',
    '/flogs',
  );

  const cropperBase = {
    cropperToolbarColor: '#000000',
    cropperToolbarWidgetColor: '#FFFFFF',
    cropperStatusBarColor: '#000000',
    cropperActiveWidgetColor: '#FFFFFF',
    freeStyleCropEnabled: true,
  };

  const toUri = (path: string) =>
    path.startsWith('file://') ? path : `file://${path}`;

  // 원본 선택 후 크롭 UI 진입 — 크롭 취소 시 사진 선택 자체를 취소
  const openCropperAfterPick = (
    originalPath: string,
    fileName: string,
    mime: string,
    width?: number,
    height?: number,
  ) => {
    const originalUri = toUri(originalPath);
    const original = {uri: originalUri, fileName, type: mime};
    const isLandscape = (width ?? 0) > (height ?? 0);

    ImageCropPicker.openCropper({
      path: originalPath,
      ...cropperBase,
      ...(isLandscape ? {} : {width: 300, height: 400}),
      cropperToolbarTitle: isLandscape
        ? '썸네일 영역을 설정해 주세요'
        : '썸네일 영역을 설정해 주세요 (3:4 권장)',
    })
      .then(cropped => {
        // 크롭 확인 후에만 사진 세팅
        setPhotoAsset(original);
        if (!firstAdded) setFirstAdded('photo');
        if (width && height) setPhotoAspectRatio(width / height);
        const asset = {
          uri: toUri(cropped.path),
          fileName: cropped.filename || fileName,
          type: cropped.mime || mime,
        };
        thumbnailAssetRef.current = asset;
        setThumbnailAsset(asset);
      })
      .catch(() => {
        // 크롭 취소 → 사진 선택 안 된 상태 유지 (아무것도 하지 않음)
      });
  };

  const pickVideo = (uri: string, fileName: string, type: string) => {
    setVideoAsset({uri, fileName, type});
    if (!firstAdded) setFirstAdded('video');
    // createThumbnail은 file:// 없는 raw path를 요구함
    const rawPath = uri.replace(/^file:\/\//, '');
    createThumbnail({url: rawPath, timeStamp: 0})
      .then(res => setVideoThumbnail(toUri(res.path)))
      .catch(() => setVideoThumbnail(null));
  };

  // 갤러리에서 사진 또는 동영상 선택
  const handlePickFromGallery = () => {
    ImageCropPicker.openPicker({mediaType: 'any', cropping: false})
      .then(media => {
        if (media.mime?.startsWith('video/')) {
          if (videoAsset) {
            setShowDuplicateAlert(true);
            return;
          }
          if (media.duration && media.duration > 20000) {
            return;
          }
          pickVideo(
            toUri(media.path),
            media.filename || 'video.mp4',
            media.mime || 'video/mp4',
          );
        } else {
          if (photoAsset) {
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

  // 카메라로 촬영
  const handlePickFromCamera = () => {
    ImageCropPicker.openCamera({mediaType: 'photo', cropping: false})
      .then(image => {
        openCropperAfterPick(
          image.path,
          image.filename || 'photo.jpg',
          image.mime || 'image/jpeg',
          image.width,
          image.height,
        );
      })
      .catch(() => {});
  };

  // 동영상 선택 (20초 이하만 허용)
  const handlePickVideo = () => {
    if (videoAsset) {
      setShowDuplicateAlert(true);
      return;
    }
    launchImageLibrary({mediaType: 'video', durationLimit: 20}, res => {
      if (res.assets && res.assets[0]) {
        const asset = res.assets[0];
        if (asset.duration && asset.duration > 20) {
          return;
        }
        pickVideo(
          asset.uri!,
          asset.fileName || 'video.mp4',
          asset.type || 'video/mp4',
        );
      }
    });
  };

  // 썸네일 재설정
  const handleReCrop = () => {
    if (!photoAsset) return;
    const isLandscape = (photoAspectRatio ?? 0) > 1;
    ImageCropPicker.openCropper({
      path: photoAsset.uri,
      ...cropperBase,
      ...(isLandscape ? {} : {width: 300, height: 400}),
      cropperToolbarTitle: isLandscape
        ? '썸네일 영역을 설정해 주세요'
        : '썸네일 영역을 설정해 주세요 (3:4 권장)',
    })
      .then(cropped => {
        const asset = {
          uri: toUri(cropped.path),
          fileName: cropped.filename || photoAsset.fileName,
          type: cropped.mime || photoAsset.type,
        };
        thumbnailAssetRef.current = asset;
        setThumbnailAsset(asset);
      })
      .catch(() => {});
  };

  // 뒤로가기 — 입력값이 있으면 경고 팝업
  const handleBack = () => {
    const hasInput =
      withText.trim() || where.trim() || memo.trim() || photoAsset;
    if (hasInput) {
      setShowBackModal(true);
    } else {
      goBack();
    }
  };

  const goBack = () => {
    navigation.canGoBack()
      ? navigation.goBack()
      : navigation.navigate('BottomTab', {screen: 'CalendarTab'});
  };

  // 기록 완료 버튼
  const handleSubmit = async () => {
    // 필수 항목 검증: 사진, 누구랑
    if (!photoAsset) {
      setShowValidationModal(true);
      return;
    }

    setIsUploading(true);
    try {
      // 1. 백엔드에서 S3 presigned URL 발급
      const presignedRes = await getPresignedUrl(
        photoAsset.fileName,
        photoAsset.type,
      );

      // 2. 원본 사진 S3 업로드 (PHOTO_URL)
      const fileBlob = await (await fetch(photoAsset.uri)).blob();
      await fetch(presignedRes.data.presignedUrl, {
        method: 'PUT',
        headers: {'Content-Type': photoAsset.type},
        body: fileBlob,
      });

      // 3. 크롭본 S3 업로드 (THUMBNAIL_URL)
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

      // 4. 동영상이 있으면 S3에 동영상 업로드
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

      // 5. flog 등록 API 호출
      mutate(
        {
          photoUrl: presignedRes.data.fileUrl,
          thumbnailUrl: thumbPresignedRes.data.fileUrl,
          videoUrl,
          date: formatDate(date),
          location: where,
          memoCtt: memo,
          tags: withText
            .split(/[,\s\n]+/)
            .map(t => t.trim())
            .filter(t => t.length > 0)
            .map(t => ({tagName: t})),
        },
        {
          onSuccess: res => {
            // 저장된 날짜의 캘린더 쿼리 무효화 → 캘린더에 즉시 반영
            const savedYearMonth = formatDate(date).substring(0, 7);
            queryClient.invalidateQueries({
              queryKey: ['calendar', savedYearMonth],
            });
            setShowSuccessModal(true);
            setTimeout(() => {
              setShowSuccessModal(false);
              navigation.replace('FlogDetail', {flogId: res.data.flogId});
            }, 3000);
          },
        },
      );
    } catch (e) {
      console.error('S3 업로드 실패', e);
    } finally {
      setIsUploading(false);
    }
  };

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
        <View>
          <Image
            source={require('@images/flog/cameraIcon.png')}
            style={styles.headerTitleIcon}
          />
          <Text style={styles.headerTitle}>새 네컷로그</Text>
        </View>

        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* 미디어 업로드 영역 */}
        <View style={styles.mediaSection}>
          {/* 미디어 선택 영역 */}
          {photoAsset || videoAsset ? (
            <View style={styles.mediaPreviewRow}>
              {/* 첫 번째 추가된 미디어 */}
              {firstAdded === 'video' ? (
                /* 동영상이 먼저 추가된 경우 — 동영상 왼쪽 */
                videoAsset ? (
                  <TouchableOpacity
                    style={styles.videoPreviewBox}
                    onPress={() => setShowVideoDelete(v => !v)}
                    activeOpacity={1}>
                    {videoThumbnail ? (
                      <Image
                        source={{uri: videoThumbnail}}
                        style={styles.videoThumbnailImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.videoIcon}>🎬</Text>
                    )}
                    {!showVideoDelete && (
                      <View style={styles.videoPlayOverlay}>
                        <Text style={styles.videoPlayIcon}>▶</Text>
                      </View>
                    )}
                    {showVideoDelete && (
                      <View style={styles.deleteOverlay}>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => {
                            setVideoAsset(null);
                            setVideoThumbnail(null);
                            setShowVideoDelete(false);
                            if (!photoAsset) setFirstAdded(null);
                          }}>
                          <Image
                            source={require('@images/flog/deleteIcon.png')}
                            style={styles.deleteBtnIcon}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                ) : null
              ) : /* 사진이 먼저 추가된 경우 — 사진 왼쪽 */
              photoAsset ? (
                <TouchableOpacity
                  style={[styles.previewBox, photoPreviewStyle]}
                  onPress={() => setShowPhotoDelete(v => !v)}
                  activeOpacity={1}>
                  <Image
                    source={{uri: photoAsset.uri}}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  {showPhotoDelete && (
                    <View style={styles.deleteOverlay}>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => {
                          setPhotoAsset(null);
                          setThumbnailAsset(null);
                          thumbnailAssetRef.current = null;
                          setFirstAdded(videoAsset ? 'video' : null);
                          setPhotoAspectRatio(null);
                          setShowPhotoDelete(false);
                        }}>
                        <Image
                          source={require('@images/flog/deleteIcon.png')}
                          style={styles.deleteBtnIcon}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ) : null}

              {/* 두 번째 미디어 or + 버튼 */}
              {firstAdded === 'video' ? (
                /* 동영상이 먼저 — 오른쪽은 사진 프리뷰 or + 버튼 */
                photoAsset ? (
                  <TouchableOpacity
                    style={[styles.previewBox, photoPreviewStyle]}
                    onPress={() => setShowPhotoDelete(v => !v)}
                    activeOpacity={1}>
                    <Image
                      source={{uri: photoAsset.uri}}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                    {showPhotoDelete && (
                      <View style={styles.deleteOverlay}>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => {
                            setPhotoAsset(null);
                            setThumbnailAsset(null);
                            thumbnailAssetRef.current = null;
                            setPhotoAspectRatio(null);
                            setFirstAdded(videoAsset ? 'video' : null);
                            setShowPhotoDelete(false);
                          }}>
                          <Image
                            source={require('@images/flog/deleteIcon.png')}
                            style={styles.deleteBtnIcon}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View>
                    <TouchableOpacity
                      style={styles.videoAddBtn}
                      onPress={handlePickFromGallery}
                      activeOpacity={0.7}>
                      <Text style={styles.videoAddBtnText}>+</Text>
                    </TouchableOpacity>
                    <Text style={styles.videoAddBtnDesc}>사진 추가</Text>
                  </View>
                )
              ) : /* 사진이 먼저 — 오른쪽은 동영상 프리뷰 or + 버튼 */
              videoAsset ? (
                <TouchableOpacity
                  style={styles.videoPreviewBox}
                  onPress={() => setShowVideoDelete(v => !v)}
                  activeOpacity={1}>
                  {videoThumbnail ? (
                    <Image
                      source={{uri: videoThumbnail}}
                      style={styles.videoThumbnailImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.videoIcon}>🎬</Text>
                  )}
                  {!showVideoDelete && (
                    <View style={styles.videoPlayOverlay}>
                      <Text style={styles.videoPlayIcon}>▶</Text>
                    </View>
                  )}
                  {showVideoDelete && (
                    <View style={styles.deleteOverlay}>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => {
                          setVideoAsset(null);
                          setVideoThumbnail(null);
                          setShowVideoDelete(false);
                        }}>
                        <Image
                          source={require('@images/flog/deleteIcon.png')}
                          style={styles.deleteBtnIcon}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ) : (
                <View>
                  <TouchableOpacity
                    style={styles.videoAddBtn}
                    onPress={handlePickVideo}
                    activeOpacity={0.7}>
                    <Text style={styles.videoAddBtnText}>+</Text>
                  </TouchableOpacity>
                  <Text style={styles.videoAddBtnDesc}>
                    동영상{'\n'}(20초 이내)
                  </Text>
                </View>
              )}
            </View>
          ) : (
            /* 아무것도 없을 때 갤러리 버튼 */
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
          {(photoAsset || videoAsset) && (
            <Text style={styles.mediaGuide}>
              선택한 사진을 터치하면 삭제할 수 있어요!
            </Text>
          )}
          {/* 썸네일 재설정 툴팁 버튼 — 크롭 완료 후 표시 */}
          {thumbnailAsset && photoAsset && (
            <TouchableOpacity
              style={styles.thumbnailTooltipBtn}
              onPress={handleReCrop}
              activeOpacity={0.7}>
              <Text style={styles.thumbnailTooltipText}>
                캘린더 썸네일 미리보기
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 폼 */}
        <View style={styles.form}>
          <FormRow label="언제" required>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={styles.inputText}>{formatDate(date)}</Text>
            </TouchableOpacity>
          </FormRow>

          <FormRow label="누구랑">
            <TextInput
              style={styles.input}
              placeholder="민지, 태산이, 혼자, 엄마 ..."
              placeholderTextColor="#C0C0C0"
              value={withText}
              onChangeText={setWithText}
              returnKeyType="next"
            />
          </FormRow>

          <FormRow label="어디서">
            <TextInput
              style={styles.input}
              placeholder="홍대입구, 집앞, 학교앞 ..."
              placeholderTextColor="#C0C0C0"
              value={where}
              onChangeText={setWhere}
              returnKeyType="next"
            />
          </FormRow>

          <FormRow label="메모" last>
            <TextInput
              style={styles.input}
              placeholder="네컷로그에 담긴 추억을 적어보세요"
              placeholderTextColor="#C0C0C0"
              value={memo}
              onChangeText={setMemo}
              returnKeyType="done"
              multiline
            />
          </FormRow>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (isPending || isUploading) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={isPending || isUploading}>
          {isPending || isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>기록 완료!</Text>
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
        visible={showValidationModal}
        title="필수 항목을 채워주세요"
        desc="사진은 필수 항목입니다"
        confirmText="확인했어요"
        onConfirm={() => setShowValidationModal(false)}
      />

      <ConfirmModal
        visible={showBackModal}
        title="입력을 취소하고 뒤로 가시겠어요?"
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

      <ToastAlert
        visible={showSuccessModal}
        message="오늘도 네컷로그 기록 완료! 🎉"
        duration={3000}
        onHide={() => setShowSuccessModal(false)}
      />
    </SafeAreaView>
  );
}

function FormRow({
  label,
  required,
  last,
  children,
}: {
  label: string;
  required?: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <View style={styles.labelWrap}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>
      <View style={styles.inputWrap}>{children}</View>
    </View>
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
  headerTitle: {
    ...textStyle({fontSize: scaleFont(17), fontWeight: '600', color: '#111'}),
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
  scroll: {flex: 1},
  scrollContent: {paddingBottom: scaleHeight(24)},

  // 미디어 영역
  mediaSection: {
    margin: scaleWidth(20),
    gap: scaleHeight(12),
  },
  thumbnailPreviewWrap: {
    gap: scaleHeight(8),
  },
  thumbnailPreviewLabel: {
    ...textStyle({fontSize: scaleFont(12), color: '#888'}),
  },
  thumbnailPreviewCell: {
    width: scaleWidth(52),
    height: scaleHeight(80),
    borderRadius: scaleWidth(4),
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailPreviewImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPreviewDayOverlay: {
    position: 'absolute',
    top: scaleHeight(4),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  thumbnailPreviewDayText: {
    ...textStyle({fontSize: scaleFont(11), color: '#fff', fontWeight: '500'}),
  },
  mediaGuide: {
    ...textStyle({fontSize: scaleFont(13), color: '#888'}),
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
    ...textStyle({fontSize: scaleFont(12), color: '#555'}),
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
  previewRemove: {
    position: 'absolute',
    top: scaleHeight(6),
    right: scaleWidth(6),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: scaleWidth(12),
    width: scaleWidth(28),
    height: scaleWidth(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewRemoveText: {fontSize: scaleFont(14)},
  videoAddBtn: {
    width: scaleWidth(35),
    aspectRatio: 1,
    borderRadius: scaleWidth(36),
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: scaleHeight(4),
  },
  videoAddBtnText: {
    ...textStyle({fontSize: scaleFont(22), color: '#888', fontWeight: '300'}),
  },
  videoAddBtnDesc: {
    ...textStyle({fontSize: scaleFont(10), color: '#AAA'}),
    textAlign: 'center',
    marginTop: scaleWidth(5),
  },
  videoPreviewBox: {
    width: scaleWidth(100),
    height: scaleHeight(200),
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
    fontSize: scaleFont(14),
    color: '#fff',
    marginLeft: scaleWidth(2),
  },
  videoIcon: {fontSize: scaleFont(28)},
  videoFileName: {
    ...textStyle({fontSize: scaleFont(10), color: '#CCC'}),
    textAlign: 'center',
  },

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
    ...textStyle({fontSize: scaleFont(15), fontWeight: '500', color: '#111'}),
  },
  required: {
    ...textStyle({
      fontSize: scaleFont(15),
      fontWeight: '500',
      color: '#E0494B',
    }),
  },
  inputWrap: {flex: 1},
  input: {...textStyle({fontSize: scaleFont(15), color: '#333'}), padding: 0},
  inputText: {...textStyle({fontSize: scaleFont(15), color: '#333'})},

  // 하단 버튼
  footer: {
    paddingHorizontal: scaleWidth(20),
    paddingBottom: Platform.OS === 'android' ? scaleHeight(20) : scaleHeight(8),
    paddingTop: scaleHeight(12),
  },
  submitBtn: {
    backgroundColor: '#111',
    borderRadius: scaleWidth(15),
    paddingVertical: scaleHeight(16),
    alignItems: 'center',
  },
  submitBtnDisabled: {backgroundColor: '#BDBDBD'},
  submitText: {
    ...textStyle({fontSize: scaleFont(16), fontWeight: '600', color: '#fff'}),
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
    ...textStyle({fontSize: scaleFont(16), fontWeight: '600', color: '#111'}),
  },
  dateModalDone: {
    ...textStyle({
      fontSize: scaleFont(16),
      fontWeight: '500',
      color: '#4A90E2',
    }),
  },
});
