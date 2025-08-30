import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

export default function CameraPage() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>('back');
    const [torchEnabled, setTorchEnabled] = useState(false);
    const [scanError, setScanError] = useState<string | null>(null);
    const [scanningEnabled, setScanningEnabled] = useState(true);
    const [qrData, setQrData] = useState<string | null>(null);
    const [locationInfo, setLocationInfo] = useState<{
        name: string;
        address: string;
        pingId: number;
        shortId: string;
    } | null>(null);
    const [helpVisible, setHelpVisible] = useState(false);
    const [helpStatus, setHelpStatus] = useState<'idle' | 'pending' | 'accepted' | 'enRoute' | 'resolved' | 'canceled'>('idle');
    const [showStatusDetails, setShowStatusDetails] = useState(false);
    const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Camera permissions loading
    if (!permission) {
        return <View style={styles.container} />;
    }

    // Camera permissions not granted
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.actionButton} onPress={requestPermission}>
                    <Text style={styles.actionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
                    <Text style={styles.actionButtonText}>Close</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Handle barcode scanned
    const isActiveCall = helpStatus === 'pending' || helpStatus === 'accepted' || helpStatus === 'enRoute';

    const generateShortId = () => Math.random().toString(36).slice(2, 8).toLowerCase();
    const generatePingId = () => Math.floor(100 + Math.random() * 900); // 3-digit id
    const generateMockLocation = () => ({
        name: 'Target',
        address: '123 Main Street, New York, NY',
        pingId: generatePingId(),
        shortId: generateShortId(),
    });

    const handleBarcodeScanned = (result: any) => {
        if (!scanningEnabled) return;
        try {
            if (result?.data) {
                // Pause scan callbacks while modal opens
                setScanningEnabled(false);
                if (isActiveCall) {
                    // A call is already active: just show the current status dialog; do not start a new one
                    setHelpVisible(true);
                    return;
                }
                setQrData(String(result.data));
                setLocationInfo(generateMockLocation());
                setHelpVisible(true);
                setHelpStatus('idle');
                setShowStatusDetails(false);
            }
        } catch (err) {
            setScanError('Error handling scan result');
        }
    };

    // simulate help status progression
    const startHelpFlow = () => {
        setHelpStatus('pending');
        setShowStatusDetails(true);
        if (statusTimer.current) clearTimeout(statusTimer.current);
        // accepted after 2s
        statusTimer.current = setTimeout(() => {
            setHelpStatus('accepted');
            // enRoute after 3s
            statusTimer.current = setTimeout(() => {
                setHelpStatus('enRoute');
                // resolved after 5s
                statusTimer.current = setTimeout(() => {
                    setHelpStatus('resolved');
                }, 5000);
            }, 3000);
        }, 2000);
    };

    const cancelHelpFlow = () => {
        if (statusTimer.current) clearTimeout(statusTimer.current);
        setHelpStatus('canceled');
    };

    const closeHelpDialog = () => {
        // Keep the help status running if active so user can have only 1 active call
        setHelpVisible(false);
        setShowStatusDetails(false);
        setScanningEnabled(true);
        // If no active call (never started or finished), clear data
        if (!isActiveCall) {
            if (statusTimer.current) clearTimeout(statusTimer.current);
            setQrData(null);
            setLocationInfo(null);
            // Do not force to idle if it is resolved/canceled; keep last status visible next time they open
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.cameraWrapper}>
                <CameraView
                    style={styles.camera}
                    facing={facing}
                    onBarcodeScanned={handleBarcodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                />
                <View style={styles.overlay} pointerEvents="box-none">
                    <View style={styles.scanArea} />
                    <Text style={styles.qrText}>
                        {isActiveCall ? 'Active help request in progress — scan to view status' : 'Scan QR to request help'}
                    </Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => setTorchEnabled((prev) => !prev)}>
                            <Text style={styles.actionButtonText}>{torchEnabled ? 'Turn off Torch' : 'Turn on Torch'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
                            <Text style={styles.actionButtonText}>Flip Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => router.push({ pathname: '../faq' })}>
                            <Text style={styles.actionButtonText}>How To Scan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
                            <Text style={styles.actionButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {scanError && (
                <Text style={styles.errorText}>{`Error: ${scanError}`}</Text>
            )}

            {/* Help Dialog */}
            <Modal
                visible={helpVisible}
                animationType="slide"
                transparent
                onRequestClose={closeHelpDialog}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Request Help</Text>
                        {locationInfo && (
                            <>
                                <Text style={styles.modalText}>Location: {locationInfo.name}</Text>
                                <Text style={styles.modalSub}>{locationInfo.address}</Text>
                                <Text style={styles.modalSub}>Ping ID: {locationInfo.pingId} • Short ID: {locationInfo.shortId}</Text>
                            </>
                        )}
                        {qrData && (
                            <Text style={styles.modalSub}>QR: {qrData}</Text>
                        )}

                        {helpStatus === 'idle' && (
                            <Text style={styles.modalText}>We can notify staff that you need assistance.</Text>
                        )}
                        {isActiveCall && (
                            <Text style={styles.modalText}>You already have an active help request. You can view status or cancel it before starting a new one.</Text>
                        )}
                        {helpStatus === 'pending' && (
                            <View style={styles.statusRow}>
                                <ActivityIndicator color="#4092c6" />
                                <Text style={styles.statusText}>Sending request…</Text>
                            </View>
                        )}
                        {helpStatus === 'accepted' && (
                            <Text style={styles.modalText}>Request accepted. A team member has seen your request.</Text>
                        )}
                        {helpStatus === 'enRoute' && (
                            <Text style={styles.modalText}>Help is on the way. Please stay nearby.</Text>
                        )}
                        {helpStatus === 'resolved' && (
                            <Text style={styles.modalText}>Request resolved. Thanks for using ping.</Text>
                        )}
                        {helpStatus === 'canceled' && (
                            <Text style={styles.modalText}>Request canceled.</Text>
                        )}

                        <View style={styles.modalButtons}>
                            {helpStatus === 'idle' && !isActiveCall && (
                                <TouchableOpacity style={styles.primaryBtn} onPress={startHelpFlow}>
                                    <Text style={styles.primaryBtnText}>Request Help</Text>
                                </TouchableOpacity>
                            )}
                            {(helpStatus === 'pending' || helpStatus === 'accepted' || helpStatus === 'enRoute') && (
                                <TouchableOpacity style={styles.warnBtn} onPress={cancelHelpFlow}>
                                    <Text style={styles.warnBtnText}>Cancel Request</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowStatusDetails((s) => !s)}>
                                <Text style={styles.secondaryBtnText}>View Status</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryBtn} onPress={closeHelpDialog}>
                                <Text style={styles.secondaryBtnText}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        {showStatusDetails && (
                            <View style={styles.statusDetails}>
                                <Text style={styles.statusHeading}>Status</Text>
                                <Text style={styles.statusLine}>• Pending: {helpStatus !== 'idle' ? 'done' : '—'}</Text>
                                <Text style={styles.statusLine}>• Accepted: {helpStatus === 'accepted' || helpStatus === 'enRoute' || helpStatus === 'resolved' ? 'done' : '—'}</Text>
                                <Text style={styles.statusLine}>• En route: {helpStatus === 'enRoute' || helpStatus === 'resolved' ? 'done' : '—'}</Text>
                                <Text style={styles.statusLine}>• Resolved: {helpStatus === 'resolved' ? 'done' : '—'}</Text>
                                {helpStatus === 'canceled' && <Text style={styles.statusLine}>• Canceled</Text>}
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
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
    cameraWrapper: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    camera: {
        flex: 1,
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
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    scanArea: {
        width: 200,
        height: 200,
        borderWidth: 2,
        borderColor: 'white',
        marginBottom: 16,
    },
    qrText: {
        fontSize: 18,
        color: 'white',
        padding: 16,
        textAlign: 'center',
        position: 'absolute',
        bottom: 120,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        flexWrap: 'wrap',
    },
    actionButton: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginHorizontal: 5,
        marginVertical: 5,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    actionButtonText: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
    },
    errorText: {
        position: 'absolute',
        bottom: 20,
        color: 'red',
        fontSize: 16,
        padding: 8,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalCard: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: '#1f1f1f',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    modalTitle: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalSub: {
        fontSize: 12,
        color: '#aaa',
        marginBottom: 12,
    },
    modalText: {
        fontSize: 16,
        color: '#ddd',
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    primaryBtn: {
        backgroundColor: '#4092c6',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        marginRight: 8,
        marginTop: 6,
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    warnBtn: {
        backgroundColor: '#8a1c1c',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        marginRight: 8,
        marginTop: 6,
    },
    warnBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    secondaryBtn: {
        borderColor: '#777',
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        marginRight: 8,
        marginTop: 6,
    },
    secondaryBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statusDetails: {
        marginTop: 12,
        backgroundColor: '#2a2a2a',
        padding: 12,
        borderRadius: 8,
        borderColor: '#3a3a3a',
        borderWidth: 1,
    },
    statusHeading: {
        fontSize: 14,
        color: '#bbb',
        marginBottom: 6,
    },
    statusLine: {
        color: '#ddd',
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    statusText: {
        color: '#ddd',
        marginLeft: 8,
    },
});
