import React, { PureComponent, MouseEvent, TouchEvent } from 'react';
import * as tf from '@tensorflow/tfjs';
import modelInfo from '../assets/model/number.json';
import DLModel from '../assets/model/number.bin';
import modelInfo2 from '../assets/model/numberPlus.json';
import DLModel2 from '../assets/model/numberPlus.bin';

/*
* 参考： https://github.com/starkwang/keras-js-demo/blob/master/src/App.vue
* */

const CANVAS_WIDTH = 280;
const CANVAS_HEIGHT = 280;
const MODEL_WIDTH = 28;
const MODEL_HEIGHT = 28;
const RATE_WIDTH = CANVAS_WIDTH / MODEL_WIDTH;
const RATE_HEIGHT = CANVAS_HEIGHT / MODEL_HEIGHT;

const loadModel = async () => {
  // modelInfo.weightsManifest[0].paths = [DLModel.slice(1)];
  // return await tf.models.modelFromJSON(modelInfo);
  modelInfo2.weightsManifest[0].paths = [DLModel2.slice(1)];
  return await tf.models.modelFromJSON(modelInfo2);
};

type Position = {
  x: number;
  y: number;
}

// position
const getPagePosition = (event: MouseEvent | TouchEvent) => {
  const assertEvent = event as TouchEvent;
  return assertEvent.changedTouches && assertEvent.changedTouches[0] || event as MouseEvent;
};
const getXYPosition = (event: MouseEvent | TouchEvent, basePosition: Position) => [getPagePosition(event).pageX - basePosition.x, getPagePosition(event).pageY - basePosition.y];

// deal
const to2d = (grayList: Array<number>) => {
  const result = [];  // length: MODEL_WIDTH * MODEL_HEIGHT, 为实际模型输入结构
  for (let x = 0; x < MODEL_WIDTH; x++) {
    for (let y = 0; y < MODEL_HEIGHT; y++) {
      // 实际落点，向方格取样
      const grayInArea = [];
      for (let tmpX = x * RATE_WIDTH; tmpX < (x + 1) * RATE_WIDTH; tmpX++) {
        for (let tmpY = y * RATE_HEIGHT; tmpY < (y + 1) * RATE_HEIGHT; tmpY++) {
          grayInArea.push(grayList[tmpY + tmpX * CANVAS_HEIGHT]);
        }
      }
      // 存入平均值
      result.push(grayInArea.reduce((acc, i) => acc + i, 0) / grayInArea.length);
    }
  }
  console.log('InputData:', result);
  return tf.tensor([result]); // 增加一维batch
};
const to4d = (grayList: Array<number>) => {
  const result = [];  // length: MODEL_WIDTH * MODEL_HEIGHT, 为实际模型输入结构
  for (let x = 0; x < MODEL_WIDTH; x++) {
    const xArray = [];
    for (let y = 0; y < MODEL_HEIGHT; y++) {
      // 实际落点，向方格取样
      const grayInArea = [];
      for (let tmpX = x * RATE_WIDTH; tmpX < (x + 1) * RATE_WIDTH; tmpX++) {
        for (let tmpY = y * RATE_HEIGHT; tmpY < (y + 1) * RATE_HEIGHT; tmpY++) {
          grayInArea.push(grayList[tmpY + tmpX * CANVAS_HEIGHT]);
        }
      }
      // 存入平均值
      xArray.push([grayInArea.reduce((acc, i) => acc + i, 0) / grayInArea.length]);
    }
    result.push(xArray);
  }
  console.log('InputData:', result);
  return tf.tensor([result]); // 增加一维batch
};
const img2Tensor = (fullData: Uint8ClampedArray) => {
  console.log('rawImageData:', fullData);
  // 转化为灰度值
  const grayList = []; // length: fullData / 4, 为实际像素总量 CANVAS_WIDTH * CANVAS_HEIGHT
  for (let i = 0; i < fullData.length; i += 4) {
    const [R, G, B, A] = fullData.slice(i, i + 4);
    const grayScale = ((R * 38 + G * 75 + B * 15) >> 7) * (A / 255);
    grayList.push(1 - grayScale / 255);
  }
  console.log('grayscaleImageData:', grayList);
  // 变形
  // return to2d(grayList);
  return to4d(grayList);
};

type State = {
  model: tf.LayersModel | null;
  result: string | null,
}

class Demo extends PureComponent<never, State> {
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  basePosition = { x: 0, y: 0 };
  isDrawing = false;
  state: State = {
    model: null,
    result: null,
  };

  constructor(props: never) {
    super(props);
    void loadModel().then((model) => {
      console.log('Model:', model);
      this.setState({ model });
    });
    window.addEventListener('resize', this.updatePosition);
    document.body.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  }

  componentDidUpdate(prevProps: never, prevState: any) {
    if (prevState.model == null && this.canvas) {
      this.updatePosition();
    }
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.updatePosition);
    document.body.removeEventListener('touchmove', e => e.preventDefault());
  }

  startDraw = (event: MouseEvent | TouchEvent) => {
    const [positionX, positionY] = getXYPosition(event, this.basePosition);
    this.isDrawing = true;
    this.ctx?.beginPath();
    this.ctx?.moveTo(positionX, positionY);
  };
  drawing = (event: MouseEvent | TouchEvent) => {
    if (this.isDrawing) {
      const [positionX, positionY] = getXYPosition(event, this.basePosition);
      this.ctx?.lineTo(positionX, positionY);
      this.ctx?.stroke();
    }
  };
  endDraw = () => {
    if (this.isDrawing && this.ctx) {
      this.isDrawing = false;
      this.ctx.closePath();
      this.getResult();
    }
  };
  clear = () => {
    if (this.canvas && this.ctx) {
      this.ctx.fillStyle = 'white'; // 背景颜色
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.setState({ result: null });
    }
  };

  updatePosition = () => {
    this.ctx = this.canvas?.getContext('2d')!;
    if (this.canvas && this.ctx) {
      // canvas configs
      this.ctx.fillStyle = 'white'; // 背景颜色
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.strokeStyle = 'black'; // 画笔颜色
      this.ctx.lineWidth = 15; // 线条宽度
      // update position
      this.basePosition = {
        x: this.canvas.getBoundingClientRect().left,
        y: this.canvas.getBoundingClientRect().top,
      };
    }
  };
  getResult = async () => {
    if (this.canvas && this.ctx) {
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
      const outputData = await this.state.model!.predict(img2Tensor(imageData));
      const predictArray = (await (outputData as any).array())[0];
      console.log('predict:', predictArray);
      const max = Math.max(...predictArray);
      this.setState({ result: predictArray.indexOf(max) });
    }
  };

  render() {
    // methods
    const { model, result } = this.state;
    return (
      <div id="app">
        <div className="canvas-container" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
          {
            model != null
              ? <canvas
                ref={ref => this.canvas = ref}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onMouseDown={this.startDraw}
                onMouseMove={this.drawing}
                onMouseUp={this.endDraw}
                onMouseLeave={this.endDraw}
                onTouchStart={this.startDraw}
                onTouchMove={this.drawing}
                onTouchEnd={this.endDraw}
              />
              : <div className="mask">Loading...</div>
          }
        </div>
        <div className="clear" onClick={this.clear}>Clear</div>
        <p className="result">Result：{result == null ? '--' : result}</p>
      </div>
    );
  }
}

export default Demo;