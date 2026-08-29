// ======================================================
// Focoto Web
// ======================================================

const photoInput = document.getElementById("photoInput");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", {
    willReadFrequently: true
});

const emptyState = document.getElementById("emptyState");
const controls = document.getElementById("controls");


// ======================================================
// 編集UI
// ======================================================

const adjustmentPanel =
    document.getElementById("adjustmentPanel");

const templatePanel =
    document.getElementById("templatePanel");

const adjustModeButton =
    document.getElementById("adjustModeButton");

const templateModeButton =
    document.getElementById("templateModeButton");

const adjustmentName =
    document.getElementById("adjustmentName");

const adjustmentIcon =
    document.getElementById("adjustmentIcon");

const currentValue =
    document.getElementById("currentValue");

const focusArea =
    document.getElementById("focusArea");

const focus =
    document.getElementById("focus");

const focusValue =
    document.getElementById("focusValue");

const saveButton =
    document.getElementById("saveButton");

const cancelButton =
    document.getElementById("cancelButton");

const saveTemplateButton =
    document.getElementById("saveTemplateButton");

const templateList =
    document.getElementById("templateList");

const noTemplates =
    document.getElementById("noTemplates");


// ======================================================
// スライダー
// ======================================================

const sliders = {

    brightness:
        document.getElementById("brightness"),

    shadows:
        document.getElementById("shadows"),

    contrast:
        document.getElementById("contrast"),

    saturation:
        document.getElementById("saturation"),

    vignette:
        document.getElementById("vignette")
};


// ======================================================
// 調整項目
// ======================================================

const adjustmentNames = [

    "明るさ",
    "シャドウ",
    "コントラスト",
    "彩度",
    "ビネット",
    "フォーカス"
];

const adjustmentIcons = [

    "☀",
    "◐",
    "◑",
    "◇",
    "◌",
    "◎"
];


// ======================================================
// 編集値
// Swift版 EditValues と対応
// ======================================================

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
// 状態
// ======================================================

let originalImage = null;

let selectedAdjustment = 0;

let currentMode = 0;


// ======================================================
// 写真読み込み
// ======================================================

photoInput.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];

        if (!file) return;

        const image =
            new Image();

        image.onload = () => {

            originalImage =
                image;

            canvas.width =
                image.naturalWidth;

            canvas.height =
                image.naturalHeight;

            emptyState.style.display =
                "none";

            canvas.style.display =
                "block";

            controls.style.display =
                "block";

            resetEditor();

            render();

            URL.revokeObjectURL(
                image.src
            );
        };

        image.src =
            URL.createObjectURL(file);
    }
);


// ======================================================
// エディター初期化
// ======================================================

function resetEditor() {

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

    Object.values(sliders)
        .forEach(slider => {

            slider.value = 0;
        });

    focus.value = 0;

    updateValueDisplay();

    selectedAdjustment = 0;

    updateAdjustmentUI();
}


// ======================================================
// モード切り替え
// ======================================================

adjustModeButton.addEventListener(
    "click",
    () => {

        currentMode = 0;

        adjustmentPanel.hidden =
            false;

        templatePanel.hidden =
            true;

        adjustModeButton.classList.add(
            "active"
        );

        templateModeButton.classList.remove(
            "active"
        );
    }
);


templateModeButton.addEventListener(
    "click",
    () => {

        currentMode = 1;

        adjustmentPanel.hidden =
            true;

        templatePanel.hidden =
            false;

        templateModeButton.classList.add(
            "active"
        );

        adjustModeButton.classList.remove(
            "active"
        );

        loadTemplates();
    }
);


// ======================================================
// 調整ボタン
// ======================================================

document
    .querySelectorAll(".adjustment-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                selectedAdjustment =
                    Number(
                        button.dataset.adjustment
                    );

                updateAdjustmentUI();
            }
        );
    });


// ======================================================
// 調整UI更新
// ======================================================

function updateAdjustmentUI() {

    document
        .querySelectorAll(".adjustment-button")
        .forEach(button => {

            const index =
                Number(
                    button.dataset.adjustment
                );

            button.classList.toggle(
                "active",
                index === selectedAdjustment
            );
        });


    adjustmentName.textContent =
        adjustmentNames[
            selectedAdjustment
        ];

    adjustmentIcon.textContent =
        adjustmentIcons[
            selectedAdjustment
        ];


    const isFocus =
        selectedAdjustment === 5;


    focusArea.hidden =
        !isFocus;


    Object.values(sliders)
        .forEach(slider => {

            slider.hidden =
                true;
        });


    if (!isFocus) {

        const names = [
            "brightness",
            "shadows",
            "contrast",
            "saturation",
            "vignette"
        ];

        sliders[
            names[selectedAdjustment]
        ].hidden = false;
    }


    updateValueDisplay();
}


// ======================================================
// 値表示
// ======================================================

function updateValueDisplay() {

    if (
        selectedAdjustment === 5
    ) {

        currentValue.textContent =
            "枠をドラッグ・ピンチ";

        focusValue.textContent =
            formatValue(
                editValues.focusAmount
            );

        return;
    }


    const names = [

        "brightness",
        "shadows",
        "contrast",
        "saturation",
        "vignette"
    ];


    const value =
        editValues[
            names[selectedAdjustment]
        ];


    currentValue.textContent =
        formatValue(value);
}


// ======================================================
// スライダー処理
// ======================================================

sliders.brightness.addEventListener(
    "input",
    () => {

        editValues.brightness =
            Number(
                sliders.brightness.value
            );

        updateValueDisplay();

        render();
    }
);


sliders.shadows.addEventListener(
    "input",
    () => {

        editValues.shadows =
            Number(
                sliders.shadows.value
            );

        updateValueDisplay();

        render();
    }
);


sliders.contrast.addEventListener(
    "input",
    () => {

        editValues.contrast =
            Number(
                sliders.contrast.value
            );

        updateValueDisplay();

        render();
    }
);


sliders.saturation.addEventListener(
    "input",
    () => {

        editValues.saturation =
            Number(
                sliders.saturation.value
            );

        updateValueDisplay();

        render();
    }
);


sliders.vignette.addEventListener(
    "input",
    () => {

        editValues.vignette =
            Number(
                sliders.vignette.value
            );

        updateValueDisplay();

        render();
    }
);


focus.addEventListener(
    "input",
    () => {

        editValues.focusAmount =
            Number(
                focus.value
            );

        updateValueDisplay();

        render();
    }
);


// ======================================================
// 画像描画
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


    if (
        selectedAdjustment === 5 &&
        editValues.focusAmount > 0
    ) {

        drawFocusOverlay();
    }
}


// ======================================================
// 画像処理
// ======================================================

function processImage() {

    const width =
        canvas.width;

    const height =
        canvas.height;


    const imageData =
        ctx.getImageData(
            0,
            0,
            width,
            height
        );


    const data =
        imageData.data;


    // ==================================================
    // 明るさ
    // ==================================================

    const brightnessAmount =
        editValues.brightness /
        100 *
        0.35;


    if (
        Math.abs(
            editValues.brightness
        ) > 0.001
    ) {

        const amount =
            brightnessAmount * 255;


        for (
            let i = 0;
            i < data.length;
            i += 4
        ) {

            data[i] += amount;
            data[i + 1] += amount;
            data[i + 2] += amount;
        }
    }


    // ==================================================
    // シャドウ
    // ==================================================

    if (
        Math.abs(
            editValues.shadows
        ) > 0.001
    ) {

        const amount =
            editValues.shadows / 100;


        for (
            let i = 0;
            i < data.length;
            i += 4
        ) {

            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];


            const luminance =
                0.299 * r +
                0.587 * g +
                0.114 * b;


            if (amount > 0) {

                const mask =
                    1 -
                    Math.min(
                        luminance / 128,
                        1
                    );


                const strength =
                    amount * mask;


                r +=
                    (255 - r) *
                    strength;

                g +=
                    (255 - g) *
                    strength;

                b +=
                    (255 - b) *
                    strength;

            } else {

                const mask =
                    Math.min(
                        luminance / 255,
                        1
                    );


                const strength =
                    Math.abs(amount) *
                    mask;


                r *=
                    1 - strength;

                g *=
                    1 - strength;

                b *=
                    1 - strength;
            }


            data[i] =
                clamp(r);

            data[i + 1] =
                clamp(g);

            data[i + 2] =
                clamp(b);
        }
    }


    // ==================================================
    // コントラスト
    // ==================================================

    if (
        Math.abs(
            editValues.contrast
        ) > 0.001
    ) {

        const factor =
            1 +
            editValues.contrast /
            100 *
            0.5;


        for (
            let i = 0;
            i < data.length;
            i += 4
        ) {

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
    // 彩度
    // ==================================================

    if (
        Math.abs(
            editValues.saturation
        ) > 0.001
    ) {

        const factor =
            Math.max(
                0,
                1 +
                editValues.saturation /
                100
            );


        for (
            let i = 0;
            i < data.length;
            i += 4
        ) {

            const r =
                data[i];

            const g =
                data[i + 1];

            const b =
                data[i + 2];


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
    // ビネット
    // ==================================================

    if (
        editValues.vignette !== 0
    ) {

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
    // Clamp
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
    // フォーカス
    // ==================================================

    if (
        editValues.focusAmount > 0
    ) {

        applyFocus();
    }
}


// ======================================================
// フォーカスぼかし
// ======================================================

function applyFocus() {

    const width =
        canvas.width;

    const height =
        canvas.height;


    const sourceCanvas =
        document.createElement(
            "canvas"
        );


    sourceCanvas.width =
        width;

    sourceCanvas.height =
        height;


    const sourceCtx =
        sourceCanvas.getContext(
            "2d"
        );


    sourceCtx.drawImage(
        canvas,
        0,
        0
    );


    const blurCanvas =
        document.createElement(
            "canvas"
        );


    blurCanvas.width =
        width;

    blurCanvas.height =
        height;


    const blurCtx =
        blurCanvas.getContext(
            "2d"
        );


    blurCtx.filter =
        `blur(${
            2 +
            editValues.focusAmount /
            100 *
            18
        }px)`;


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


            let mask;


            if (
                distance <= radius0
            ) {

                mask = 1;

            } else if (
                distance >= radius1
            ) {

                mask = 0;

            } else {

                const t =
                    (
                        distance -
                        radius0
                    ) /
                    (
                        radius1 -
                        radius0
                    );


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
// フォーカス枠
// ======================================================

function drawFocusOverlay() {

    const width =
        canvas.clientWidth;

    const height =
        canvas.clientHeight;


    const scaleX =
        canvas.width /
        width;

    const scaleY =
        canvas.height /
        height;


    const centerX =
        editValues.focusPosition.x *
        width;

    const centerY =
        editValues.focusPosition.y *
        height;


    const ellipseWidth =
        Math.min(
            width,
            height
        ) *
        editValues.focusSize;


    const ellipseHeight =
        ellipseWidth *
        0.68;


    ctx.save();


    ctx.setTransform(
        scaleX,
        0,
        0,
        scaleY,
        0,
        0
    );


    ctx.beginPath();


    ctx.ellipse(
        centerX,
        centerY,
        ellipseWidth / 2,
        ellipseHeight / 2,
        0,
        0,
        Math.PI * 2
    );


    ctx.strokeStyle =
        "white";

    ctx.lineWidth =
        2;


    ctx.stroke();


    ctx.restore();
}


// ======================================================
// フォーカスドラッグ
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
    event => {

        if (
            selectedAdjustment !== 5
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

            x:
                editValues.focusPosition.x,

            y:
                editValues.focusPosition.y
        };
    }
);


canvas.addEventListener(
    "pointermove",
    event => {

        if (
            !draggingFocus
        ) {
            return;
        }


        const rect =
            canvas.getBoundingClientRect();


        const dx =
            (
                event.clientX -
                dragStart.x
            ) /
            rect.width;


        const dy =
            (
                event.clientY -
                dragStart.y
            ) /
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
    event => {

        draggingFocus = false;

        try {

            canvas.releasePointerCapture(
                event.pointerId
            );

        } catch {}
    }
);


// ======================================================
// フォーカスピンチ
// ======================================================

let pinchStartDistance =
    null;

let pinchStartSize =
    0.45;


canvas.addEventListener(
    "touchstart",
    event => {

        if (
            selectedAdjustment !== 5
        ) {
            return;
        }


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
    {
        passive: true
    }
);


canvas.addEventListener(
    "touchmove",
    event => {

        if (
            selectedAdjustment !== 5
        ) {
            return;
        }


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
                pinchStartSize *
                scale,
                0.15,
                0.9
            );


        render();
    },
    {
        passive: true
    }
);


canvas.addEventListener(
    "touchend",
    () => {

        pinchStartDistance =
            null;
    }
);


function getTouchDistance(
    a,
    b
) {

    const dx =
        a.clientX -
        b.clientX;

    const dy =
        a.clientY -
        b.clientY;


    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}


// ======================================================
// マイテンプレ
// ======================================================

saveTemplateButton.addEventListener(
    "click",
    () => {

        const name =
            prompt(
                "テンプレート名"
            );


        const template = {

            id:
                crypto.randomUUID(),

            name:
                name ||
                `テンプレート ${
                    getTemplates().length + 1
                }`,

            brightness:
                editValues.brightness,

            shadows:
                editValues.shadows,

            contrast:
                editValues.contrast,

            saturation:
                editValues.saturation,

            vignette:
                editValues.vignette
        };


        const templates =
            getTemplates();


        templates.push(
            template
        );


        localStorage.setItem(
            "myTemplates",
            JSON.stringify(
                templates
            )
        );


        loadTemplates();
    }
);


// ======================================================
// テンプレート読み込み
// ======================================================

function getTemplates() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "myTemplates"
            )
        ) || [];

    } catch {

        return [];
    }
}


function loadTemplates() {

    const templates =
        getTemplates();


    templateList.innerHTML =
        "";


    if (
        templates.length === 0
    ) {

        templateList.appendChild(
            noTemplates
        );

        return;
    }


    templates.forEach(
        template => {

            const card =
                createTemplateCard(
                    template
                );


            templateList.appendChild(
                card
            );
        }
    );
}


// ======================================================
// テンプレートカード
// ======================================================

function createTemplateCard(
    template
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "template-card";


    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        template.name;


    const values =
        document.createElement(
            "p"
        );


    values.textContent =

        `明るさ ${formatValue(template.brightness)}  ` +
        `シャドウ ${formatValue(template.shadows)}\n` +

        `コントラスト ${formatValue(template.contrast)}  ` +
        `彩度 ${formatValue(template.saturation)}\n` +

        `ビネット ${formatValue(template.vignette)}`;


    const apply =
        document.createElement(
            "button"
        );


    apply.textContent =
        "適用";


    apply.className =
        "template-apply-button";


    apply.addEventListener(
        "click",
        () => {

            applyTemplate(
                template
            );
        }
    );


    card.appendChild(
        title
    );

    card.appendChild(
        values
    );

    card.appendChild(
        apply
    );


    return card;
}


// ======================================================
// テンプレート適用
// ======================================================

function applyTemplate(
    template
) {

    editValues.brightness =
        template.brightness;

    editValues.shadows =
        template.shadows;

    editValues.contrast =
        template.contrast;

    editValues.saturation =
        template.saturation;

    editValues.vignette =
        template.vignette;


    sliders.brightness.value =
        template.brightness;

    sliders.shadows.value =
        template.shadows;

    sliders.contrast.value =
        template.contrast;

    sliders.saturation.value =
        template.saturation;

    sliders.vignette.value =
        template.vignette;


    updateValueDisplay();

    render();
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


        // フォーカス枠を表示しない状態で保存
        const previous =
            selectedAdjustment;


        selectedAdjustment =
            -1;


        render();


        canvas.toBlob(
            blob => {

                if (!blob) {

                    selectedAdjustment =
                        previous;

                    render();

                    return;
                }


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    url;

                link.download =
                    "Focoto.jpg";


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                URL.revokeObjectURL(
                    url
                );


                selectedAdjustment =
                    previous;


                render();
            },
            "image/jpeg",
            0.95
        );
    }
);


// ======================================================
// キャンセル
// ======================================================

cancelButton.addEventListener(
    "click",
    () => {

        if (!originalImage) {
            return;
        }


        resetEditor();

        render();
    }
);


// ======================================================
// ユーティリティ
// ======================================================

function clamp(
    value
) {

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


function formatValue(
    value
) {

    const rounded =
        Math.round(value);


    if (rounded > 0) {

        return `+${rounded}`;
    }


    return `${rounded}`;
}


// ======================================================
// 起動時
// ======================================================

updateAdjustmentUI();

loadTemplates();