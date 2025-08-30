import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import QrScanner from 'qr-scanner';

function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  const toggleTorch = async () => {
    if (trackRef.current) {
      const constraints: MediaTrackConstraints = { advanced: [{ torch: !torchEnabled } as any] };
      try {
        await trackRef.current.applyConstraints(constraints);
        setTorchEnabled((prev) => !prev);
      } catch (e) {
        console.error('Error toggling torch:', e);
      }
    } else {
      console.warn('No video track available to toggle torch');
    }
  };

  useEffect(() => {
  let qrScanner: any;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        const [track] = stream.getVideoTracks();
        trackRef.current = track || null;
        const capabilities: any = track?.getCapabilities?.() || {};
        setTorchSupported(Boolean(capabilities && 'torch' in capabilities));
      } catch (e) {
        console.error('Error accessing the camera:', e);
        setError('Error accessing the camera.');
      }

      if (videoRef.current) {
    qrScanner = new (QrScanner as any)(videoRef.current, (result: any) => {
          try {
            const data = typeof result === 'string' ? result : result?.data;
            if (data) {
      // Navigate to FAQ or handle within this screen; avoid non-existent typed route
      router.push('../faq');
            }
          } catch (err) {
            console.error('QR result handling error', err);
          }
        });
        await qrScanner.start();
      }
    };

    init();

    return () => {
      try {
        if (qrScanner) qrScanner.destroy();
      } catch {}
      try {
        if (trackRef.current) trackRef.current.stop();
      } catch {}
    };
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Using a native video element for web */}
  <video ref={videoRef as any} style={styles.video as any} autoPlay playsInline muted />
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={styles.qrText}>Scan or Tap to Order</Text>
        {torchSupported && (
          <Button title={torchEnabled ? 'Turn off Torch' : 'Turn on Torch'} onPress={toggleTorch} />
        )}
        <TouchableOpacity style={styles.faqButton} onPress={() => router.push('../faq')}>
          <Text style={styles.faqButtonText}>How To Scan</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{`Error: ${error}`}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'white',
  },
  qrText: {
    fontSize: 18,
    color: 'white',
    padding: 16,
    textAlign: 'center',
    position: 'absolute',
    bottom: 120,
  },
  errorText: {
    position: 'absolute',
    bottom: 20,
    color: 'red',
    fontSize: 16,
    padding: 8,
  },
  faqButton: {
    marginTop: 10,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  faqButtonText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

export default CameraPage;
