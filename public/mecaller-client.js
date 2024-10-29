class Mecaller {
    constructor(mcUrl, apiKey, id) {

        this.socket = io(
            `${mcUrl}?apiKey=${apiKey}&&id=${id}`
        );

        this.localStream = null;
        this.peerConnection = null;

        this.socket.on('error', (message) => console.error(message));

        this.socket.on('offer', async (data) => {
            this.peerConnection = new RTCPeerConnection();
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.thislocalStream);
            });

            const answer = await peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.socket.emit('answer', {
                to: data.from,
                answer: answer
            });

            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socket.emit('candidate', {
                        to: data.from,
                        candidate: event.candidate
                    });
                }
            };

            peerConnection.ontrack = (event) => {
                const audio = document.createElement('audio');
                audio.srcObject = event.streams[0];
                audio.play();
            };
        });

        this.socket.on('answer', (data) => {
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        this.socket.on('candidate', (data) => {
            this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        });

    }

    async call(callId) {
        this.peerConnection = RTCPeerConnection;
        const offer = this.peerConnection.createOffer()

        this.socket.emit('offer', {
            to: callId,
            offer: offer
        })
    }
}
