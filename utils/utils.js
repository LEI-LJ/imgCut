export const handleModifySize = function(res) {
	const containerWidth = uni.getSystemInfoSync().screenWidth;
	const containerHeight = 450;
	const imageWidth = res.width;
	const imageHeight = res.height;
	const aspectRatio = imageWidth / imageHeight;
	let displayWidth, displayHeight;

	if (containerWidth / containerHeight > aspectRatio) {
		displayHeight = containerHeight;
		displayWidth = containerHeight * aspectRatio;
	} else {
		displayWidth = containerWidth;
		displayHeight = containerWidth / aspectRatio;
	}
	return {
		displayWidth,
		displayHeight,
		imageWidth,
		imageHeight,
	};
}