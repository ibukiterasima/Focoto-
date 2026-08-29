const photoInput = document.getElementById("photoInput");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

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

let editValues = {
    brightness: 0,
    shadows: 0,
    contrast: 0,
    saturation: 0,
    vignette: 0,

    focusPosition: {
        x: 0.5,
        y: 0.5
    },

    focusSize: 0.45,
    focusAmount: 0
};


// ======================================================
// 写真読み込み
// ======================================================

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


// ======================================================
// スライダー
// ======================================================

brightness.addEventListener("input", () => {

    editValues.brightness =
        Number(brightness.value);

    brightnessValue.textContent =
        formatValue(editValues.brightness);

    render();
});


shadows.addEventListener("input", () => {

    editValues.shadows =
        Number(shadows.value);

    shadowsValue.textContent =
        formatValue(editValues.shadows);

    render();
});


contrast.addEventListener("input", () => {

    editValues.contrast =
        Number(contrast.value);

    contrastValue.textContent =
        formatValue(editValues.contrast);

    render();
});


saturation.addEventListener("input", () => {

    editValues.saturation =
        Number(saturation.value);

    saturationValue.textContent =
        formatValue(editValues.saturation);

    render();
});


vignette.addEventListener("input", () => {

    editValues.vignette =
        Number(vignette.value);

    vignetteValue.textContent =
        formatValue(editValues.vignette);

    render();
});


focus.addEventListener("input", () => {

    editValues.focusAmount =
        Number(focus.value);

    focusValue.textContent =
        formatValue(editValues.focusAmount);

    render();
});


// ======================================================
// 初期化
// ======================================================

function resetValues() {

    editValues = {

        brightness: 0,
        shadows: 0,
        contrast: 0,
        saturation: 0,
        vignette: 0,

        focusPosition: {
            x: 0.5,
            y: 0.5
        },

        focusSize: 0.45,
        focusAmount: 0
    };

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


// ======================================================
// 描画
// ======================================================

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

    processImage();
}


// ======================================================
// 画像処理
// Swift版 ImageProcessor.process() の移植
// ======================================================

function processImage() {

    if (!originalImage) return;

    const width = canvas.width;
    const height = canvas.height;

    const imageData =
        ctx.getImageData(
            0,
            0,
            width,
            height
        );

    const data = imageData.data;


    // ==================================================
    // Brightness
    // Swift:
    // brightness / 100 * 0.35
    // ==================================================

    const brightnessAmount =
        editValues.brightness / 100 * 0.35;


    if (Math.abs(editValues.brightness) > 0.001) {

        for (let i = 0; i < data.length; i += 4) {

            data[i] +=
                brightnessAmount * 255;

            data[i + 1] +=
                brightnessAmount * 255;

            data[i + 2] +=
                brightnessAmount * 255;
        }
    }


    // ==================================================
    // Shadows
    // ==================================================

    if (Math.abs(editValues.shadows) > 0.001) {

        const amount =
            editValues.shadows / 100;

        for (let i = 0; i < data.length; i += 4) {

            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            if (amount > 0) {

                /*
                 Swiftの
                 highlightShadowAdjust()
                 のシャドウ持ち上げに近い処理
                */

                const luminance =
                    0.299 * r +
                    0.587 * g +
                    0.114 * b;

                const shadowMask =
                    1 -
                    Math.min(
                        luminance / 128,
                        1
                    );

                const strength =
                    amount * shadowMask;

                r +=
                    (255 - r) * strength;

                g +=
                    (255 - g) * strength;

                b +=
                    (255 - b) * strength;

            } else {

                /*
                 Swift版では
                 shadows < 0 のとき
                 highlightAmountを下げる
                */

                const darken =
                    Math.abs(amount);

                const luminance =
                    0.299 * r +
                    0.587 * g +
                    0.114 * b;

                const highlightMask =
                    Math.min(
                        luminance / 255,
                        1
                    );

                const strength =
                    darken *
                    highlightMask;

                r *=
                    1 - strength;

                g *=
                    1 - strength;

                b *=
                    1 - strength;
            }

            data[i] = clamp(r);
            data[i + 1] = clamp(g);
            data[i + 2] = clamp(b);
        }
    }


    // ==================================================
    // Contrast
    // Swift:
    // 1 + contrast / 100 * 0.5
    // ==================================================

    if (Math.abs(editValues.contrast) > 0.001) {

        const factor =
            1 +
            editValues.contrast /
            100 *
            0.5;

        for (let i = 0; i < data.length; i += 4) {

            data[i] =
                (data[i] - 128) *
                factor +
                128;

            data[i + 1] =
                (data[i + 1] - 128) *
                factor +
                128;

            data[i + 2] =
                (data[i + 2] - 128) *
                factor +
                128;
        }
    }


    // ==================================================
    // Saturation
    // ==================================================

    if (Math.abs(editValues.saturation) > 0.001) {

        const factor =
            Math.max(
                0,
                1 +
                editValues.saturation /
                100
            );

        for (let i = 0; i < data.length; i += 4) {

            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const gray =
                0.299 * r +
                0.587 * g +
                0.114 * b;

            data[i] =
                gray +
                (r - gray) *
                factor;

            data[i + 1] =
                gray +
                (g - gray) *
                factor;

            data[i + 2] =
                gray +
                (b - gray) *
                factor;
        }
    }


    // ==================================================
    // Vignette
    // ==================================================

    if (editValues.vignette !== 0) {

        const amount =
            editValues.vignette / 100;

        const centerX =
            width / 2;

        const centerY =
            height / 2;

        const maxDistance =
            Math.sqrt(
                centerX * centerX +
                centerY * centerY
            );


        for (
            let y = 0;
            y < height;
            y++
        ) {

            for (
                let x = 0;
                x < width;
                x++
            ) {

                const dx =
                    x - centerX;

                const dy =
                    y - centerY;

                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    ) /
                    maxDistance;

                const index =
                    (y * width + x) * 4;


                if (amount > 0) {

                    /*
                     Swiftの
                     CIFilter.vignette()
                     に近い自然な減光
                    */

                    const strength =
                        Math.pow(
                            distance,
                            2
                        ) *
                        amount *
                        1.2;

                    data[index] *=
                        1 - strength;

                    data[index + 1] *=
                        1 - strength;

                    data[index + 2] *=
                        1 - strength;

                } else {

                    /*
                     Swift版の
                     vignette < 0

                     中央を明るくする
                    */

                    const strength =
                        Math.pow(
                            distance,
                            2
                        );

                    const boost =
                        Math.abs(amount) *
                        0.7 *
                        (1 - strength);

                    data[index] *=
                        1 + boost;

                    data[index + 1] *=
                        1 + boost;

                    data[index + 2] *=
                        1 + boost;
                }
            }
        }
    }


    // ==================================================
    // 値を確定
    // ==================================================

    for (
        let i = 0;
        i < data.length;
        i += 4
    ) {

        data[i] =
            clamp(data[i]);

        data[i + 1] =
            clamp(data[i + 1]);

        data[i + 2] =
            clamp(data[i + 2]);
    }


    ctx.putImageData(
        imageData,
        0,
        0
    );


    // ==================================================
    // Focus
    //
    // ★ 必ず最後に適用
    // ==================================================

    if (
        editValues.focusAmount > 0
    ) {

        applyFocus();
    }
}


// ======================================================
// Focus
// ======================================================

function applyFocus() {

    const amount =
        editValues.focusAmount;

    if (amount <= 0) return;


    const width =
        canvas.width;

    const height =
        canvas.height;


    // 現在の画像を保存
    const sourceCanvas =
        document.createElement("canvas");

    sourceCanvas.width =
        width;

    sourceCanvas.height =
        height;

    const sourceCtx =
        sourceCanvas.getContext("2d");

    sourceCtx.drawImage(
        canvas,
        0,
        0
    );


    // ぼかし画像
    const blurCanvas =
        document.createElement("canvas");

    blurCanvas.width =
        width;

    blurCanvas.height =
        height;

    const blurCtx =
        blurCanvas.getContext("2d");

    blurCtx.filter =
        `blur(${2 + amount / 100 * 18}px)`;

    blurCtx.drawImage(
        sourceCanvas,
        0,
        0
    );


    const original =
        sourceCtx.getImageData(
            0,
            0,
            width,
            height
        );

    const blurred =
        blurCtx.getImageData(
            0,
            0,
            width,
            height
        );


    const output =
        ctx.createImageData(
            width,
            height
        );


    const centerX =
        editValues.focusPosition.x *
        width;

    const centerY =
        editValues.focusPosition.y *
        height;


    const radius =
        Math.min(
            width,
            height
        ) *
        editValues.focusSize *
        0.9;


    const radius0 =
        radius * 0.55;

    const radius1 =
        radius * 1.45;


    for (
        let y = 0;
        y < height;
        y++
    ) {

        for (
            let x = 0;
            x < width;
            x++
        ) {

            const index =
                (y * width + x) * 4;


            const dx =
                x - centerX;

            const dy =
                y - centerY;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            // SwiftのradialGradientに近いマスク
            let mask;

            if (distance <= radius0) {

                mask = 1;

            } else if (distance >= radius1) {

                mask = 0;

            } else {

                const t =
                    (distance - radius0) /
                    (radius1 - radius0);

                // smoothstep
                mask =
                    1 -
                    (
                        t * t *
                        (3 - 2 * t)
                    );
            }


            output.data[index] =
                original.data[index] *
                mask +
                blurred.data[index] *
                (1 - mask);

            output.data[index + 1] =
                original.data[index + 1] *
                mask +
                blurred.data[index + 1] *
                (1 - mask);

            output.data[index + 2] =
                original.data[index + 2] *
                mask +
                blurred.data[index + 2] *
                (1 - mask);

            output.data[index + 3] =
                original.data[index + 3];
        }
    }


    ctx.putImageData(
        output,
        0,
        0
    );
}


// ======================================================
// Focusドラッグ
// ======================================================

let draggingFocus = false;

let dragStart = {
    x: 0,
    y: 0
};

let focusStart = {
    x: 0.5,
    y: 0.5
};


canvas.addEventListener(
    "pointerdown",
    (event) => {

        if (
            editValues.focusAmount <= 0
        ) {
            return;
        }

        draggingFocus = true;

        canvas.setPointerCapture(
            event.pointerId
        );

        dragStart = {
            x: event.clientX,
            y: event.clientY
        };

        focusStart = {
            x: editValues.focusPosition.x,
            y: editValues.focusPosition.y
        };
    }
);


canvas.addEventListener(
    "pointermove",
    (event) => {

        if (!draggingFocus) return;

        const rect =
            canvas.getBoundingClientRect();

        const dx =
            (event.clientX -
                dragStart.x) /
            rect.width;

        const dy =
            (event.clientY -
                dragStart.y) /
            rect.height;


        editValues.focusPosition.x =
            clampNumber(
                focusStart.x + dx,
                0.08,
                0.92
            );

        editValues.focusPosition.y =
            clampNumber(
                focusStart.y + dy,
                0.08,
                0.92
            );

        render();
    }
);


canvas.addEventListener(
    "pointerup",
    (event) => {

        draggingFocus = false;

        try {
            canvas.releasePointerCapture(
                event.pointerId
            );
        } catch {}
    }
);


// ======================================================
// ピンチでFocusサイズ変更
// ======================================================

let pinchStartDistance = null;
let pinchStartSize = 0.45;

canvas.addEventListener(
    "touchstart",
    (event) => {

        if (
            event.touches.length !== 2
        ) {
            return;
        }

        pinchStartDistance =
            getTouchDistance(
                event.touches[0],
                event.touches[1]
            );

        pinchStartSize =
            editValues.focusSize;
    },
    { passive: true }
);


canvas.addEventListener(
    "touchmove",
    (event) => {

        if (
            event.touches.length !== 2 ||
            pinchStartDistance === null
        ) {
            return;
        }

        const currentDistance =
            getTouchDistance(
                event.touches[0],
                event.touches[1]
            );

        const scale =
            currentDistance /
            pinchStartDistance;


        editValues.focusSize =
            clampNumber(
                pinchStartSize * scale,
                0.15,
                0.9
            );

        render();
    },
    { passive: true }
);


canvas.addEventListener(
    "touchend",
    () => {

        pinchStartDistance = null;
    }
);


function getTouchDistance(a, b) {

    const dx =
        a.clientX - b.clientX;

    const dy =
        a.clientY - b.clientY;

    return Math.sqrt(
        dx * dx + dy * dy
    );
}


// ======================================================
// 保存
// ======================================================

saveButton.addEventListener(
    "click",
    () => {

        if (!originalImage) {
            return;
        }

        canvas.toBlob(
            (blob) => {

                if (!blob) return;

                const url =
                    URL.createObjectURL(blob);

                const link =
                    document.createElement("a");

                link.href = url;
                link.download =
                    "Focoto.jpg";

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                setTimeout(() => {
                    URL.revokeObjectURL(url);
                }, 1000);

            },
            "image/jpeg",
            0.95
        );
    }
);


// ======================================================
// ユーティリティ
// ======================================================

function clamp(value) {

    return Math.max(
        0,
        Math.min(
            255,
            value
        )
    );
}


function clampNumber(
    value,
    min,
    max
) {

    return Math.min(
        Math.max(
            value,
            min
        ),
        max
    );
}


function formatValue(value) {

    if (value > 0) {
        return `+${Math.round(value)}`;
    }

    return `${Math.round(value)}`;
}