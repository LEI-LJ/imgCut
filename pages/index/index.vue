<template>
	<view>
		<view class="content " style="position: relative; display: flex; justify-content: center">
			<image :src="bgImage" :style="defineStyle"></image>
			<canvas class="defCanvasClass" :style="defineStyle" canvas-id="defCanvas" id="defCanvas"
				@touchstart="penStart" @touchmove="penMove" @touchend="penEnd"></canvas>

		</view>
		<view>
			<button @click="handleSave">保存图片</button>
			<button @click="handleExport">上传图片</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				myCanvasContext: null,
				bgImage: null,
				// 原图片尺寸
				orgSize: {
					width: 375,
					height: 450,
				},
				// 尺寸
				size: {
					width: 375,
					height: 450,
				},
				// 原图大小
				scale: 1, //  图片缩放比例
				dx: 0, //  图片偏移 x
				dy: 0, //  图片偏移 y
				// 这个地方可以使用size 的尺寸
				// dw: origin.width,
				// dh: origin.height,
				//  裁剪位置
				// 左上角距离 x 和 y的距离 右下角 到x和y的距离
				initX: 50,
				initY: 50,
				endX: '',
				endY: '',
				//  裁剪状态
				now: 0,
				modify: false,
				lastX: 0,
				lastY: 0,
			}
		},
		onLoad() {},
		computed: {
			defineStyle() {
				return `width:${this.size.width}px;height:${this.size.height}px;`;
			},
		},
		watch: {},
		methods: {
			handleOperatingLine() {
				// 先清除 内容
				this.myCanvasContext.clearRect(0, 0, orgSize.width, orgSize.height)
				this.myCanvasContext.fillStyle = 'rgba(0,0,0,0.4)';
				this.myCanvasContext.fillRect(0, 0, orgSize.width, this.initY);
				this.myCanvasContext.fillRect(0, this.endY, orgSize.width, orgSize.height - this.initY);
				this.myCanvasContext.fillRect(0, this.initY, this.initX, this.endY - this.initY);
				this.myCanvasContext.fillRect(this.endX, this.initY, orgSize.width - this.endX, this.endY - this.initY);
				this.myCanvasContext.restore()
				// 边缘线
				this.myCanvasContext.save()
				this.myCanvasContext.strokeStyle = 'red';
				this.myCanvasContext.setLineDash([5, 5])
				this.myCanvasContext.moveTo(this.initX, this.initY);
				this.myCanvasContext.lineTo(this.endX, this.initY);
				this.myCanvasContext.lineTo(this.endX, this.endY);
				this.myCanvasContext.lineTo(this.initX, this.endY);
				this.myCanvasContext.closePath();
				this.myCanvasContext.stroke();
				// 矩形四周点
				this.myCanvasContext.fillStyle = '#fff';
				this.myCanvasContext.fillRect(this.initX - 5, this.initY - 5, 10, 10);
				this.myCanvasContext.fillRect(this.endX - 5, this.initY - 5, 10, 10);
				this.myCanvasContext.fillRect(this.endX - 5, this.endY - 5, 10, 10);
				this.myCanvasContext.fillRect(this.initX - 5, this.endY - 5, 10, 10);
				this.myCanvasContext.beginPath();
				this.myCanvasContext.restore()
			},
			handleQuShuiYing(fn) {
				let _this = this;
				uni.chooseImage({
					sizeType: ['compressed', 'original'],
					count: 1,
					success: (img) => {
						uni.getImageInfo({
							src: img.tempFilePaths[0],
							success: async (res) => {
								// 处理动态编译	
								const {
									handleModifySize
								} = await import('../../utils/utils.js')
								const {
									displayWidth,
									displayHeight,
									imageWidth,
									imageHeight
								} = handleModifySize(res);
								this.bgImage = res.path;
								this.size = {
									width: displayWidth,
									height: displayHeight,
								};
								this.orgSize = {
									width: imageWidth,
									height: imageHeight,
								};

								this.$nextTick(() => {
									fn();
								});
							},
						});
					},
				});
			},
			beforePenStart(fn, e) {
				const _this = this;
				if (!this.bgImage) {
					this.handleQuShuiYing(fn);
				} else {
					fn(e);
				}
			},
			// penStart
			penStart(e) {
				const _this = this;
				this.beforePenStart(() => {
					this.handleOperatingLine();
				}, e);
			},
			penMove(e) {
				if (!this.myCanvasContext) return
				let x = e.offsetX
				let y = e.offsetY
				//  判定类型
				if ((x > this.initX + 5 && x < this.endX - 5) && (y < this.initY + 5 && y > this.initY -
						5)) { //  上边
					this.Fnow = 1
				} else if ((x < this.endX + 5 && x > this.endX - 5) && (y > this.initY + 5 && y < this.endY -
						5)) { //  右边
					this.now = 2
				} else if ((x > this.initX + 5 && x < this.endX - 5) && (y < this.endY + 5 && y > this.endY -
						5)) { //  下边
					this.now = 3
				} else if ((x < this.initX + 5 && x > this.initX - 5) && (y > this.initY + 5 && y < this.endY -
						5)) { //  左边
					this.now = 4
				} else if (x <= this.initX + 5 && x >= this.initX - 5 && y <= this.initY + 5 && y >= this.initY -
					5) { //  左上角
					this.now = 5
				} else if (x <= this.endX + 5 && x >= this.endX - 5 && y <= this.endY + 5 && y >= this.endY -
					5) { //  右下角
					this.now = 6
				} else if (x <= this.endX + 5 && x >= this.endX - 5 && y <= this.initY + 5 && y >= this.initY -
					5) { //  右上角
					this.now = 7
				} else if (x <= this.initX + 5 && x >= this.initX - 5 && y <= this.endY + 5 && y >= this.endY -
					5) { //  左下角
					this.now = 8
				} else if (x > this.initX + 5 && x < this.endX - 5 && y > this.initY + 5 && y < this.endY -
					5) { //  移动
					this.now = 9
				} else {
					this.now = 0
				}
				//  若在拖动根据类型更改值
				if (this.modify) {
					switch (this.now) {
						case 1: //  上边
							this.initY = e.offsetY
							break
						case 2: //  右边
							this.endX = e.offsetX
							break
						case 3: //  下边
							this.endY = e.offsetY
							break
						case 4: //  左边
							this.initX = e.offsetX
							break
						case 5: //  左上角
							this.initX = e.offsetX
							this.initY = e.offsetY
							break
						case 6: //  右下角
							this.endY = e.offsetY
							this.endX = e.offsetX
							break
						case 7: //  右上角
							this.endX = e.offsetX
							this.initY = e.offsetY
							break

						case 8: //  左下角
							this.initX = e.offsetX
							this.endY = e.offsetY
							break
						case 9: //  左下角
							let vx = e.offsetX - this.lastX
							let vy = e.offsetY - this.lastY
							this.initX += vx
							this.endX += vx
							this.initY += vy
							this.endY += vy
							//  更新
							this.lastX = e.offsetX
							this.lastY = e.offsetY
							break


					}
					//  更新
					this.drawOperatingLine()
				}
			},
			penEnd(e) {
				// if (this.modify) {
				// 	this.modify = false
				// }
			}
		}
	}
</script>

<style lang="scss" scoped>
	.newCanvasClass {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		visibility: hidden;
	}

	.defCanvasClass {
		z-index: 1;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>