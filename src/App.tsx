import roomImage from "./assets/room.png";
import lampImage from "./assets/lamp.png";
import cameraFrameImage from "./assets/camera_frame.png";
import "./App.css";

import type { JSX } from "solid-js";
import { createEffect, createMemo, createSignal } from "solid-js";

function App() {
  const [filterR, setFilterR] = createSignal(0);
  const [filterG, setFilterG] = createSignal(0);
  const [filterB, setFilterB] = createSignal(0);
  const filterR255 = createMemo(() => (filterR() * 255) / 100);
  const filterG255 = createMemo(() => (filterG() * 255) / 100);
  const filterB255 = createMemo(() => (filterB() * 255) / 100);
  const filterAlpha = createMemo(() => Math.min(filterR() + filterG() + filterB(), 100) / 100);

  const [lampR, setLampR] = createSignal(0);
  const [lampG, setLampG] = createSignal(0);
  const [lampB, setLampB] = createSignal(0);
  const lampAlpha = createMemo(() => Math.min((lampR() + lampG() + lampB()) / 255, 1) / 2);

  let backgroundImg: HTMLImageElement;
  let cameraScreenImg: HTMLImageElement;

  const changeFilterR: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    setFilterR(Number(e.currentTarget.value));
  };

  const changeFilterG: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    setFilterG(Number(e.currentTarget.value));
  };

  const changeFilterB: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    setFilterB(Number(e.currentTarget.value));
  };

  const changeLampR: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    setLampR(Number(e.currentTarget.value));
  };

  const changeLampG: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    setLampG(Number(e.currentTarget.value));
  };

  const changeLampB: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    setLampB(Number(e.currentTarget.value));
  };

  function filterImage() {
    const lampRLocal = lampR();
    const lampGLocal = lampG();
    const lampBLocal = lampB();
    const filterRLocal = filterR();
    const filterGLocal = filterG();
    const filterBLocal = filterB();
    // Compute camera image with the effect of light and filter
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const canvasWidth = backgroundImg.width;
    const canvasHeight = backgroundImg.height;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context.drawImage(backgroundImg, 0, 0, canvasWidth, canvasHeight);

    const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
    for (let i = 0; i < imageData.data.length; i += 4) {
      // Add light, approximate with alpha overlay
      const alpha = Math.min((lampRLocal + lampGLocal + lampBLocal) / 255, 1) / 2;

      imageData.data[i] *= 1 - alpha;
      imageData.data[i + 1] *= 1 - alpha;
      imageData.data[i + 2] *= 1 - alpha;

      imageData.data[i] += lampRLocal * alpha;
      imageData.data[i + 1] += lampGLocal * alpha;
      imageData.data[i + 2] += lampBLocal * alpha;

      // Apply filter
      imageData.data[i] *= (100 - filterRLocal) / 100;
      imageData.data[i + 1] *= (100 - filterGLocal) / 100;
      imageData.data[i + 2] *= (100 - filterBLocal) / 100;

      // Clamp value
      imageData.data[i] = Math.min(imageData.data[i], 255);
      imageData.data[i + 1] = Math.min(imageData.data[i + 1], 255);
      imageData.data[i + 2] = Math.min(imageData.data[i + 2], 255);
    }
    context.putImageData(imageData, 0, 0);

    cameraScreenImg.src = canvas.toDataURL();
  }

  createEffect(filterImage);

  return (
    <>
      <img
        class="background"
        src={roomImage}
        alt="Room picture"
        onLoad={filterImage}
        ref={backgroundImg}
      />
      <div
        class="background lamp-overlay"
        style={{ "background-color": `rgba(${lampR()}, ${lampG()}, ${lampB()}, ${lampAlpha()})` }}
      ></div>
      <div class="lamp">
        <div
          class="lightbulb"
          style={{ "background-color": `rgb(${lampR()}, ${lampG()}, ${lampB()})` }}
        ></div>
        <img src={lampImage} alt="Lamp" />
      </div>
      <div class="camera">
        <div class="cameraFrame">
          <img src={cameraFrameImage} alt="Camera frame" />
          <div class="screen">
            <img
              class="cameraFrameContent"
              src={roomImage}
              alt="room picture"
              ref={cameraScreenImg}
            />
          </div>
          <div class="filterControl">
            <p class="wordsFilter">Lens Filter</p>
            <div class="lens">
              <div
                style={{
                  "background-color": `rgba(${filterR255()}, ${filterG255()}, ${filterB255()}, ${filterAlpha()})`,
                }}
              ></div>
            </div>
            <p class="wordsColor">Filter Color</p>
            <form>
              <label class="words">Red</label>
              <input
                type="range"
                value="0"
                name="filter_R"
                min="0"
                max="100"
                onChange={changeFilterR}
              />
              <label class="words">Green</label>
              <input
                type="range"
                value="0"
                name="filter_G"
                min="0"
                max="100"
                onChange={changeFilterG}
              />
              <label class="words">Blue</label>
              <input
                type="range"
                value="0"
                name="filter_B"
                min="0"
                max="100"
                onChange={changeFilterB}
              />
            </form>
          </div>
        </div>
      </div>
      <div class="lampControl">
        <p class="wordsControl">Lamp Color Controller</p>
        <form>
          <label class="words">Red</label>
          <input type="range" name="lamp_R" value="0" min="0" max="255" onChange={changeLampR} />
          <label class="words">Green</label>
          <input type="range" name="lamp_G" value="0" min="0" max="255" onChange={changeLampG} />
          <label class="words">Blue</label>
          <input type="range" name="lamp_B" value="0" min="0" max="255" onChange={changeLampB} />
        </form>
      </div>
    </>
  );
}

export default App;
