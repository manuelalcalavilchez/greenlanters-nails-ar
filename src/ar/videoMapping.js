export function mapLandmarksToCover(landmarks, videoWidth, videoHeight, stageWidth, stageHeight) {
  if (!videoWidth || !videoHeight || !stageWidth || !stageHeight) return landmarks;

  const scale = Math.max(stageWidth / videoWidth, stageHeight / videoHeight);
  const displayedWidth = videoWidth * scale;
  const displayedHeight = videoHeight * scale;
  const offsetX = (stageWidth - displayedWidth) / 2;
  const offsetY = (stageHeight - displayedHeight) / 2;

  return landmarks.map((point) => ({
    ...point,
    x: (point.x * videoWidth * scale + offsetX) / stageWidth,
    y: (point.y * videoHeight * scale + offsetY) / stageHeight,
  }));
}
