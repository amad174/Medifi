/* Medifi — Scan/Paste screen. Camera capture, image upload, OCR, paste text,
 * or pick a sample letter, then "Make my plan". */
(function () {
  const { Button, Input } = window.MedifiDesignSystem_063852;
  const Icon = window.Icon;
  const OCR = window.MedifiOCR;
  const PDF = window.MedifiPdf;
  const Matcher = window.MedifiLetterMatcher;

  /** Map a screen rectangle to source pixels (object-fit: cover). */
  function mapDisplayRectToSource(sourceW, sourceH, displayEl, targetRect) {
    const dw = displayEl.clientWidth;
    const dh = displayEl.clientHeight;
    const scale = Math.max(dw / sourceW, dh / sourceH);
    const renderedW = sourceW * scale;
    const renderedH = sourceH * scale;
    const offsetX = (renderedW - dw) / 2;
    const offsetY = (renderedH - dh) / 2;
    const displayBox = displayEl.getBoundingClientRect();
    const relX = targetRect.left - displayBox.left;
    const relY = targetRect.top - displayBox.top;
    return {
      sx: Math.max(0, (relX + offsetX) / scale),
      sy: Math.max(0, (relY + offsetY) / scale),
      sw: Math.min(sourceW, targetRect.width / scale),
      sh: Math.min(sourceH, targetRect.height / scale),
    };
  }

  function cropSourceToBlob(sourceW, sourceH, drawSource, frameRect, videoEl) {
    const crop = mapDisplayRectToSource(sourceW, sourceH, videoEl, frameRect);
    const longEdge = Math.max(crop.sw, crop.sh);
    const outScale = Math.min(2.5, 3200 / longEdge);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(crop.sw * outScale);
    canvas.height = Math.round(crop.sh * outScale);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawSource(ctx, crop, canvas.width, canvas.height);
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) { resolve(blob); }, "image/jpeg", 0.97);
    });
  }

  function CameraView({ onCancel, onCapture }) {
    const videoRef = React.useRef(null);
    const viewRef = React.useRef(null);
    const frameRef = React.useRef(null);
    const streamRef = React.useRef(null);
    const [cameraReady, setCameraReady] = React.useState(false);
    const [cameraError, setCameraError] = React.useState("");
    const [flash, setFlash] = React.useState(false);

    React.useEffect(() => {
      let cancelled = false;

      async function startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError("Your browser does not support the camera. Use upload image instead.");
          return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
              width: { min: 1280, ideal: 1920, max: 4096 },
              height: { min: 720, ideal: 1080, max: 4096 },
              focusMode: { ideal: "continuous" },
            },
            audio: false,
          });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          const video = videoRef.current;
          if (video) {
            video.srcObject = stream;
            await video.play();
            setCameraReady(true);
            setCameraError("");
          }
        } catch (err) {
          setCameraError(
            err.name === "NotAllowedError"
              ? "Camera access was blocked. Allow camera permission or upload an image instead."
              : "Could not open the camera. Try uploading an image instead."
          );
        }
      }

      startCamera();
      return function cleanup() {
        cancelled = true;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };
    }, []);

    function stopCamera() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(function (t) { t.stop(); });
        streamRef.current = null;
      }
      setCameraReady(false);
    }

    async function takePhoto() {
      const video = videoRef.current;
      const viewEl = viewRef.current;
      const frameEl = frameRef.current;
      if (!video || !video.videoWidth || !viewEl || !frameEl) return;

      setFlash(true);
      window.setTimeout(function () { setFlash(false); }, 180);

      const frameRect = frameEl.getBoundingClientRect();
      let blob = null;

      try {
        const track = streamRef.current && streamRef.current.getVideoTracks()[0];
        if (track && typeof window.ImageCapture !== "undefined") {
          const capture = new window.ImageCapture(track);
          const photoBlob = await capture.takePhoto();
          const photoUrl = URL.createObjectURL(photoBlob);
          const photoImg = await new Promise(function (resolve, reject) {
            const img = new Image();
            img.onload = function () { URL.revokeObjectURL(photoUrl); resolve(img); };
            img.onerror = reject;
            img.src = photoUrl;
          });
          blob = await cropSourceToBlob(
            photoImg.naturalWidth,
            photoImg.naturalHeight,
            function (ctx, crop, outW, outH) {
              ctx.drawImage(photoImg, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, outW, outH);
            },
            frameRect,
            video
          );
        }
      } catch (_) {
        blob = null;
      }

      if (!blob) {
        blob = await cropSourceToBlob(
          video.videoWidth,
          video.videoHeight,
          function (ctx, crop, outW, outH) {
            ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, outW, outH);
          },
          frameRect,
          video
        );
      }

      stopCamera();
      if (blob) onCapture(blob);
    }

    return (
      <div className="mf-cam">
        <div className="mf-cam__top">
          <button type="button" className="mf-cam__btn" aria-label="Cancel" onClick={onCancel}>
            <Icon name="x" size={22} />
          </button>
          <span className="t">Take a photo</span>
          <span style={{ width: 40 }} />
        </div>

        <div className="mf-cam__view" ref={viewRef}>
          {!cameraError && (
            <React.Fragment>
              <video ref={videoRef} className="mf-cam__video" playsInline muted />
              <div className="mf-cam__frame" ref={frameRef}><span></span><span></span><span></span><span></span></div>
              {flash && <div className="mf-cam__flash" aria-hidden="true" />}
              {!cameraReady && <p className="mf-cam__hint">Starting camera…</p>}
              {cameraReady && <p className="mf-cam__hint">Fit the whole letter inside the corners, then tap the button</p>}
            </React.Fragment>
          )}
          {cameraError && (
            <div className="mf-cam__error">
              <Icon name="alert" size={28} />
              <p>{cameraError}</p>
            </div>
          )}
        </div>

        <div className="mf-cam__bar">
          {cameraReady && !cameraError && (
            <button type="button" className="mf-cam__shutter" aria-label="Take photo" onClick={takePhoto}></button>
          )}
        </div>
      </div>
    );
  }

  function ImagePreview({ url, name, progress, error, onRemove }) {
    return (
      <div className="mf-img-preview">
        <img src={url} alt="Uploaded letter" className="mf-img-preview__img" />
        <div className="mf-img-preview__meta">
          <span className="mf-img-preview__name">{name}</span>
          {progress != null && !error && (
            <span className="mf-img-preview__progress">Claude reading your letter… {progress}%</span>
          )}
          {error && <span className="mf-img-preview__error">{error}</span>}
          {!progress && !error && (
            <button type="button" className="mf-link" onClick={onRemove}>Remove image</button>
          )}
        </div>
      </div>
    );
  }

  function ScanScreen({ onAnalyze }) {
    const [text, setText] = React.useState("");
    const [picked, setPicked] = React.useState(null);
    const [mode, setMode] = React.useState("form");
    const [imageUrl, setImageUrl] = React.useState("");
    const [imageName, setImageName] = React.useState("");
    const [ocrProgress, setOcrProgress] = React.useState(null);
    const [ocrError, setOcrError] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [handwriting, setHandwriting] = React.useState(false);
    const [ocrNote, setOcrNote] = React.useState("");
    const [visionPlan, setVisionPlan] = React.useState(null);

    const cameraInputRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const imageUrlRef = React.useRef("");

    React.useEffect(function () {
      imageUrlRef.current = imageUrl;
      return function () {
        if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
      };
    }, [imageUrl]);

    function clearImage() {
      if (imageUrl && imageUrl.indexOf("blob:") === 0) URL.revokeObjectURL(imageUrl);
      setImageUrl("");
      setImageName("");
      setOcrProgress(null);
      setOcrError("");
      setOcrNote("");
      setVisionPlan(null);
    }

    function pickSample(letter) {
      clearImage();
      setText(letter.original);
      setPicked(letter);
    }

    function analyzeFromText(rawText, letterOverride) {
      const trimmed = (rawText || "").trim();
      if (!trimmed) return;
      if (letterOverride || (picked && picked.original === trimmed)) {
        onAnalyze(letterOverride || picked);
        return;
      }
      onAnalyze({ text: trimmed });
    }

    function analyze() {
      if (visionPlan && visionPlan.original && visionPlan.original.trim() === text.trim()) {
        onAnalyze(visionPlan);
        return;
      }
      analyzeFromText(text, picked && text.trim() === picked.original ? picked : null);
    }

    function isImageFile(file) {
      if (!file) return false;
      if (file.type && file.type.startsWith("image/")) return true;
      return /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(file.name || "");
    }

    async function tryClaudeVision(file, autoScan) {
      if (!window.MedifiLLM) return null;
      try {
        const health = await window.MedifiLLM.health();
        if (!health.llm || health.provider !== "anthropic") return null;
        setOcrNote("Claude is reading your letter…");
        const plan = await window.MedifiLLM.parseLetterImage(file, setOcrProgress);
        const extracted = (plan.original || "").trim();
        if (extracted.replace(/\s/g, "").length < 6) return null;
        setVisionPlan(plan);
        setText(extracted);
        setPicked(null);
        setOcrProgress(null);
        setBusy(false);
        setOcrNote(
          autoScan
            ? "Letter read — building your plan…"
            : "Claude read your letter — check the text below, then tap Make my plan."
        );
        return { ok: true, text: extracted, plan: plan };
      } catch (visionErr) {
        const msg = visionErr.message || "Claude could not read this file.";
        const hardFail = /API error|No API key|not valid JSON|not reachable/i.test(msg);
        if (hardFail) throw visionErr;
        console.warn("[Medifi] Claude vision failed:", msg);
        setOcrNote("");
        setOcrProgress(0);
        return null;
      }
    }

    async function processImageFile(file, options) {
      const autoScan = options && options.autoScan;
      if (!isImageFile(file)) {
        setOcrError("Please choose a photo or image file (JPEG, PNG, or WebP).");
        return { ok: false };
      }

      clearImage();
      setPicked(null);
      setBusy(true);
      setOcrError("");
      setOcrProgress(0);
      setOcrNote("");

      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setImageName(file.name || "Letter photo");

      try {
        let vision = null;
        try {
          setOcrNote("Claude is reading your letter photo…");
          vision = await tryClaudeVision(file, autoScan);
        } catch (visionErr) {
          setOcrError(visionErr.message || "Claude could not read this photo.");
          setBusy(false);
          setOcrProgress(null);
          return { ok: false };
        }
        if (vision) return vision;

        const extracted = await OCR.readImage(file, setOcrProgress, { handwriting });
        if (!extracted || extracted.replace(/\s/g, "").length < 6) {
          setOcrError(
            handwriting
              ? "Could not read enough handwriting. Try brighter light, plain paper, and larger writing — or type it in the box below."
              : "Could not read any text from this image. Try a clearer photo, turn on handwritten mode, or paste the text."
          );
          setBusy(false);
          setOcrProgress(null);
          return { ok: false };
        }
        setVisionPlan(null);
        setText(extracted);
        setPicked(null);
        setOcrProgress(null);
        setBusy(false);
        setOcrNote(
          autoScan
            ? "Photo captured — building your plan…"
            : "Text read from your image — check it below, then tap Make my plan."
        );
        return { ok: true, text: extracted };
      } catch (err) {
        setOcrError(err.message || "Could not read this image. Try again or paste the text.");
        setBusy(false);
        setOcrProgress(null);
        return { ok: false };
      }
    }

    async function processPdfFile(file) {
      if (!PDF || !PDF.isPdfFile(file)) {
        setOcrError("Please choose a PDF file.");
        return { ok: false };
      }

      clearImage();
      setPicked(null);
      setBusy(true);
      setOcrError("");
      setOcrProgress(0);
      setOcrNote("Reading your PDF…");
      setImageName(file.name || "Letter.pdf");

      try {
        const result = await PDF.readPdf(file, setOcrProgress, { handwriting });
        if (result.previewUrl) setImageUrl(result.previewUrl);

        let extracted = (result.text || "").trim();
        if (extracted.replace(/\s/g, "").length < 80) {
          setOcrNote("Scanned PDF — using Claude on the first page…");
          const pageFile = await PDF.pdfFirstPageToFile(file);
          try {
            const vision = await tryClaudeVision(pageFile, false);
            if (vision) return vision;
          } catch (visionErr) {
            if (/API error|No API key|not valid JSON|not reachable/i.test(visionErr.message || "")) {
              throw visionErr;
            }
          }
        }

        if (!extracted || extracted.replace(/\s/g, "").length < 6) {
          setOcrError("Could not read text from this PDF. Try a clearer scan or paste the text below.");
          setBusy(false);
          setOcrProgress(null);
          return { ok: false };
        }

        setVisionPlan(null);
        setText(extracted);
        setOcrProgress(null);
        setBusy(false);
        setOcrNote(
          "PDF read (" + result.pageCount + " page" + (result.pageCount === 1 ? "" : "s") + ") — check the text, then tap Make my plan."
        );
        return { ok: true, text: extracted };
      } catch (err) {
        setOcrError(err.message || "Could not read this PDF. Try again or paste the text.");
        setBusy(false);
        setOcrProgress(null);
        return { ok: false };
      }
    }

    function handleFileChange(e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      if (PDF && PDF.isPdfFile(file)) processPdfFile(file);
      else processImageFile(file);
    }

    async function handleCameraCapture(blob) {
      setMode("form");
      const file = new File([blob], "letter-photo.jpg", { type: "image/jpeg" });
      const result = await processImageFile(file, { autoScan: true });
      if (result.ok && result.plan) {
        onAnalyze(result.plan);
      } else if (result.ok && result.text) {
        analyzeFromText(result.text, null);
      }
    }

    function openCamera() {
      setMode("camera");
    }

    function openFilePicker() {
      fileInputRef.current?.click();
    }

    function openNativeCamera() {
      cameraInputRef.current?.click();
    }

    if (mode === "camera") {
      return (
        <CameraView
          onCancel={() => setMode("form")}
          onCapture={handleCameraCapture}
        />
      );
    }

    return (
      <div className="mf-screen">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif,.heic,.heif,application/pdf,.pdf"
          className="mf-sr-only"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="mf-sr-only"
          onChange={handleFileChange}
        />

        <div className="mf-scan-mode">
          <button
            type="button"
            className={"mf-chip" + (handwriting ? " mf-chip--on" : "")}
            onClick={() => setHandwriting((h) => !h)}
          >
            {handwriting ? "Handwritten letter — on" : "Handwritten letter"}
          </button>
          <span className="mf-scan-mode__hint">
            {handwriting ? "Extra contrast for notes and handwriting" : "Turn on for handwritten letters"}
          </span>
        </div>

        <div className="mf-tiles mf-tiles--scan">
          <button type="button" className="mf-tile" onClick={openCamera}>
            <span className="mf-tile__icon"><Icon name="camera" size={26} /></span>
            <span className="mf-tile__t">Take a photo</span>
            <span className="mf-tile__s">Tap once to capture, then we scan it</span>
          </button>
          <button type="button" className="mf-tile mf-tile--alt" onClick={openFilePicker}>
            <span className="mf-tile__icon"><Icon name="file" size={26} /></span>
            <span className="mf-tile__t">Upload file</span>
            <span className="mf-tile__s">Photo or PDF from your files</span>
          </button>
          <button type="button" className="mf-tile mf-tile--alt" onClick={openNativeCamera}>
            <span className="mf-tile__icon"><Icon name="scan" size={26} /></span>
            <span className="mf-tile__t">Quick camera</span>
            <span className="mf-tile__s">Opens your phone camera app</span>
          </button>
        </div>

        {imageUrl && (
          <ImagePreview
            url={imageUrl}
            name={imageName}
            progress={ocrProgress}
            error={ocrError}
            onRemove={clearImage}
          />
        )}

        {ocrNote && !ocrError && (
          <div className="mf-note mf-note--ok">
            <Icon name="check" size={18} />
            <span>{ocrNote}</span>
          </div>
        )}

        {ocrError && (
          <div className="mf-banner">
            <Icon name="alert" size={20} />
            <span>{ocrError}</span>
          </div>
        )}

        <div className="mf-section">
          <p className="mf-section__label">Or try a sample letter</p>
          <div className="mf-chips">
            {window.MEDIFI_LETTERS.map((l) => (
              <button key={l.id} type="button"
                className={"mf-chip" + (picked && picked.id === l.id ? " mf-chip--on" : "")}
                onClick={() => pickSample(l)}>
                {l.chip}
              </button>
            ))}
          </div>
        </div>

        <div className="mf-paste-wrap">
          <Input id="mf-paste" multiline label="Letter text"
            placeholder="Paste the words from your NHS letter, text message, or email here…"
            value={text} onChange={(e) => { setText(e.target.value); setPicked(null); }} />
        </div>

        <Button variant="primary" size="lg" fullWidth disabled={!text.trim() || busy}
          iconLeft={<Icon name="sparkle" size={20} />} onClick={analyze}>
          {busy ? "Reading your letter…" : "Make my plan"}
        </Button>
        <p className="mf-disclaimer">Medifi helps you understand and organise letters. Always check against your original letter.</p>
      </div>
    );
  }
  window.ScanScreen = ScanScreen;
})();
