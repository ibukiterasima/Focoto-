const photoInput = document.getElementById("photoInput");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const emptyState = document.getElementById("emptyState");
const controls = document.getElementById("controls");
const saveButton = document.getElementById("saveButton");

const brightness = document.getElementById("brightness");
const shadows = document.getElementById("shadows");
const contrast = document.getElementById("contrast");
const saturation = document.getElementById("saturation");
const vignette = document.getElementById("vignette");
const focus = document.getElementById("focus");

const brightnessValue = document.getElementById("brightnessValue");
const shadowsValue = document.getElementById("shadowsValue");
const contrastValue = document.getElementById("contrastValue");
const saturationValue = document.getElementById("saturationValue");
const vignetteValue = document.getElementById("vignetteValue");
const focusValue = document.getElementById("focusValue");

let originalImage = null;


// ==============================
// 写真を選択
// ==============================

photoInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const image = new Image();

    image.onload = () => {

        originalImage = image;

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        emptyState.style.display = "none";
        canvas.style.display = "block";
        controls.style.display = "block";

        resetValues();
        render();

        URL.revokeObjectURL(image.src);
    };

    image.src = URL.createObjectURL(file);
});


// ==============================
// スライダー
// ==============================

const sliders = [
    [brightness, brightnessValue],
    [shadows, shadowsValue],
    [contrast, contrastValue],
    [saturation, saturationValue],
    [vignette, vignetteValue],
    [focus, focusValue]
];

sliders.forEach(([slider, value]) => {

    slider.addEventListener("input", () => {

        value.textContent = slider.value;

        render();
    });

});


// ==============================
// 初期値に戻す
// ==============================

function resetValues() {

    brightness.value = 0;
    shadows.value = 0;
    contrast.value = 0;
    saturation.value = 0;
    vignette.value = 0;
    focus.value = 0;

    brightnessValue.textContent = "0";
    shadowsValue.textContent = "0";
    contrastValue.textContent = "0";
    saturationValue.textContent = "0";
    vignetteValue.textContent = "0";
    focusValue.textContent = "0";
}


// ==============================
// 画像を描画
// ==============================

function render() {

    if (!originalImage) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.drawImage(
        originalImage,
        0,
        0,
        canvas.width,
        canvas.height
    );

    applyImageAdjustments();
}


// ==============================
// 画像編集
// ==============================

function applyImageAdjustments() {

    const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const data = imageData.data;

    const brightnessAmount = Number(brightness.value);
    const contrastAmount = Number(contrast.value);
    const saturationAmount = Number(saturation.value);
    const shadowAmount = Number(shadows.value);

    const contrastFactor =
        (259 * (contrastAmount + 255)) /
        (255 * (259 - contrastAmount));

    for (let i = 0; i < data.length; i += 4) {

        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // --------------------------
        // 明るさ
        // --------------------------

        r += brightnessAmount;
        g += brightnessAmount;
        b += brightnessAmount;


        // --------------------------
        // シャドウ
        // --------------------------

        const average = (r + g + b) / 3;

        if (average < 128) {

            const shadowFactor =
                shadowAmount / 100;

            r += (255 - r) * shadowFactor;
            g += (255 - g) * shadowFactor;
            b += (255 - b) * shadowFactor;
        }


        // --------------------------
        // コントラスト
        // --------------------------

        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;


        // --------------------------
        // 彩度
        // --------------------------

        const gray =
            0.299 * r +
            0.587 * g +
            0.114 * b;

        const saturationFactor =
            1 + saturationAmount / 100;

        r = gray + (r - gray) * saturationFactor;
        g = gray + (g - gray) * saturationFactor;
        b = gray + (b - gray) * saturationFactor;


        data[i] = clamp(r);
        data[i + 1] = clamp(g);
        data[i + 2] = clamp(b);
    }

    ctx.putImageData(imageData, 0, 0);

    applyVignette();
    applyFocus();
}


// ==============================
// ビネット
// ==============================

function applyVignette() {

    const amount = Number(vignette.value);

    if (amount <= 0) return;

    const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const data = imageData.data;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const maxDistance =
        Math.sqrt(
            centerX * centerX +
            centerY * centerY
        );

    for (let y = 0; y < canvas.height; y++) {

        for (let x = 0; x < canvas.width; x++) {

            const dx = x - centerX;
            const dy = y - centerY;

            const distance =
                Math.sqrt(dx * dx + dy * dy) /
                maxDistance;

            const strength =
                Math.pow(distance, 2) *
                (amount / 100);

            const index =
                (y * canvas.width + x) * 4;

            data[index] *= 1 - strength;
            data[index + 1] *= 1 - strength;
            data[index + 2] *= 1 - strength;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}


// ==============================
// フォーカス
// ==============================

function applyFocus() {

    const amount = Number(focus.value);

    if (amount <= 0) return;

    // フォーカス処理は
    // ここからさらに前のFocoto仕様に合わせて調整する
}


// ==============================
// 数値を0〜255に収める
// ==============================

function clamp(value) {

    return Math.max(
        0,
        Math.min(255, value)
    );
}


// ==============================
// 保存
// ==============================

saveButton.addEventListener("click", () => {

    if (!originalImage) return;

    canvas.toBlob((blob) => {

        if (!blob) return;

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download = "Focoto.jpg";

        link.click();

        URL.revokeObjectURL(url);

    }, "image/jpeg", 0.95);
});