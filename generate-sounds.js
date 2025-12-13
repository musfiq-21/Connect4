const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        function statusMessage(msg) {
            document.getElementById('status').innerHTML = msg;
        }

        function downloadAudio(audioBuffer, filename) {
            const offlineContext = new OfflineAudioContext(1, audioBuffer.length, audioBuffer.sampleRate);
            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(offlineContext.destination);
            source.start(0);

            offlineContext.startRendering().then(renderedBuffer => {
                const wav = encodeWAV(renderedBuffer);
                const blob = new Blob([wav], { type: 'audio/wav' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = filename.replace('.mp3', '.wav');
                link.textContent = `Download ${filename.replace('.mp3', '.wav')}`;
                link.style.display = 'inline-block';
                link.style.margin = '10px 5px';
                link.style.padding = '10px 15px';
                link.style.background = '#2196F3';
                link.style.color = 'white';
                link.style.textDecoration = 'none';
                link.style.borderRadius = '4px';
                
                document.getElementById('status').appendChild(document.createElement('br'));
                document.getElementById('status').appendChild(link);
            });
        }

        function encodeWAV(audioBuffer) {
            const channels = [];
            for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
                channels.push(audioBuffer.getChannelData(i));
            }

            const interleaved = interleave(...channels);
            const dataView = encodeWAVData(interleaved, audioBuffer.sampleRate);
            return dataView.buffer;
        }

        function interleave(...channels) {
            const length = channels[0].length * channels.length;
            const result = new Float32Array(length);
            let index = 0;
            const channelCount = channels.length;

            for (let i = 0; i < channels[0].length; i++) {
                for (let j = 0; j < channelCount; j++) {
                    result[index++] = channels[j][i];
                }
            }
            return result;
        }

        function encodeWAVData(samples, sampleRate) {
            const buffer = new ArrayBuffer(44 + samples.length * 2);
            const view = new DataView(buffer);

            const writeString = (offset, string) => {
                for (let i = 0; i < string.length; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            };

            const channels = 1;
            const bitDepth = 16;

            writeString(0, 'RIFF');
            view.setUint32(4, 36 + samples.length * 2, true);
            writeString(8, 'WAVE');
            writeString(12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, channels, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * 2, true);
            view.setUint16(32, channels * 2, true);
            view.setUint16(34, bitDepth, true);
            writeString(36, 'data');
            view.setUint32(40, samples.length * 2, true);

            let offset = 44;
            for (let i = 0; i < samples.length; i++) {
                view.setInt16(offset, samples[i] < 0 ? samples[i] * 0x8000 : samples[i] * 0x7FFF, true);
                offset += 2;
            }

            return view;
        }

        function generateMoveSound() {
            statusMessage('Generating move sound...');
            const duration = 0.15;
            const sampleRate = 44100;
            const offlineContext = new OfflineAudioContext(1, duration * sampleRate, sampleRate);
            
            const osc = offlineContext.createOscillator();
            const gain = offlineContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, 0);
            gain.gain.setValueAtTime(0.3, 0);
            gain.gain.exponentialRampToValueAtTime(0.01, duration);
            
            osc.connect(gain);
            gain.connect(offlineContext.destination);
            osc.start(0);
            osc.stop(duration);
            
            offlineContext.startRendering().then(buffer => {
                downloadAudio(buffer, 'move.mp3');
                statusMessage('✓ Move sound generated! <br><strong>Save the file as: sounds/move.wav</strong>');
            });
        }

        function generateWinSound() {
            statusMessage('Generating win sound...');
            const sampleRate = 44100;
            const duration = 0.6;
            const offlineContext = new OfflineAudioContext(1, duration * sampleRate, sampleRate);
            
            const frequencies = [523.25, 659.25, 783.99];
            const timings = [0, 0.2, 0.4];
            
            frequencies.forEach((freq, i) => {
                const osc = offlineContext.createOscillator();
                const gain = offlineContext.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, 0);
                gain.gain.setValueAtTime(0, timings[i]);
                gain.gain.linearRampToValueAtTime(0.3, timings[i] + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, timings[i] + 0.2);
                
                osc.connect(gain);
                gain.connect(offlineContext.destination);
                osc.start(timings[i]);
                osc.stop(timings[i] + 0.2);
            });
            
            offlineContext.startRendering().then(buffer => {
                downloadAudio(buffer, 'win.mp3');
                statusMessage('✓ Win sound generated! <br><strong>Save the file as: sounds/win.wav</strong>');
            });
        }

        function generateDrawSound() {
            statusMessage('Generating draw sound...');
            const sampleRate = 44100;
            const duration = 0.3;
            const offlineContext = new OfflineAudioContext(1, duration * sampleRate, sampleRate);
            
            for (let i = 0; i < 2; i++) {
                const osc = offlineContext.createOscillator();
                const gain = offlineContext.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, i * 0.15);
                gain.gain.setValueAtTime(0, i * 0.15);
                gain.gain.linearRampToValueAtTime(0.3, i * 0.15 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, i * 0.15 + 0.15);
                
                osc.connect(gain);
                gain.connect(offlineContext.destination);
                osc.start(i * 0.15);
                osc.stop(i * 0.15 + 0.15);
            }
            
            offlineContext.startRendering().then(buffer => {
                downloadAudio(buffer, 'draw.mp3');
                statusMessage('✓ Draw sound generated! <br><strong>Save the file as: sounds/draw.wav</strong>');
            });
        }

        function generateBackgroundMusic() {
            statusMessage('Generating background music...');
            const sampleRate = 44100;
            const duration = 30; 
            const offlineContext = new OfflineAudioContext(1, duration * sampleRate, sampleRate);
            
            
            const notes = [
                { freq: 392, start: 0, duration: 0.5 },
                { freq: 440, start: 0.5, duration: 0.5 },
                { freq: 494, start: 1, duration: 0.5 },
                { freq: 523.25, start: 1.5, duration: 0.5 },
                { freq: 494, start: 2, duration: 0.5 },
                { freq: 440, start: 2.5, duration: 0.5 },
            ];
            
            
            for (let rep = 0; rep < Math.floor(duration / 3); rep++) {
                notes.forEach(note => {
                    const osc = offlineContext.createOscillator();
                    const gain = offlineContext.createGain();
                    
                    osc.type = 'sine';
                    const startTime = rep * 3 + note.start;
                    
                    osc.frequency.setValueAtTime(note.freq, startTime);
                    gain.gain.setValueAtTime(0.15, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.02, startTime + note.duration);
                    
                    osc.connect(gain);
                    gain.connect(offlineContext.destination);
                    osc.start(startTime);
                    osc.stop(startTime + note.duration);
                });
            }
            
            offlineContext.startRendering().then(buffer => {
                downloadAudio(buffer, 'background.mp3');
                statusMessage('✓ Background music generated! <br><strong>Save the file as: sounds/background.wav</strong>');
            });
        }

        window.addEventListener('load', () => {
            statusMessage('<strong>Ready to generate sounds!</strong> Click buttons to generate and download audio files.');
        });