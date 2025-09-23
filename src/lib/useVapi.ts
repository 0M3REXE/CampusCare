import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";

const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ""; // Replace with your actual public key
const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || ""; // Replace with your actual assistant ID

const useVapi = () => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [conversation, setConversation] = useState<
    { role: string; text: string; timestamp: string; isFinal: boolean }[]
  >([]);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  type MinimalVapi = {
    on: (event: string, handler: (arg?: unknown) => void) => unknown;
    start?: (assistantId: string) => Promise<void>;
    stop?: () => Promise<void> | void;
    setMuted?: (muted: boolean) => void;
    say?: (text: string, endAfter?: boolean) => void;
    send?: (payload: unknown) => void;
  };
  const vapiRef = useRef<MinimalVapi | null>(null);

  const initializeVapi = useCallback(() => {
    if (!vapiRef.current) {
  const vapiInstance = new Vapi(publicKey);
  vapiRef.current = vapiInstance as unknown as MinimalVapi;

      vapiInstance.on("call-start", () => {
        setIsSessionActive(true);
      });

      vapiInstance.on("call-end", () => {
        setIsSessionActive(false);
        setConversation([]); // Reset conversation on call end
      });

      vapiInstance.on("volume-level", (volume: number) => {
        setVolumeLevel(volume);
      });

      type TranscriptType = 'partial' | 'final';
      type TranscriptMsg = { type: 'transcript'; role: string; transcript: string; transcriptType: TranscriptType };
      type FunctionCallMsg = { type: 'function-call'; functionCall: { name: string; parameters: { url?: string } } };
      type VapiMessage = TranscriptMsg | FunctionCallMsg | { type: string; [k: string]: unknown };

      vapiInstance.on("message", (message: unknown) => {
        const msg = message as VapiMessage;
        if (msg.type === "transcript") {
          const t = msg as TranscriptMsg;
          setConversation((prev) => {
            const timestamp = new Date().toLocaleTimeString();
            const updatedConversation = [...prev];
            if (t.transcriptType === "final") {
              // Find the partial message to replace it with the final one
              const partialIndex = updatedConversation.findIndex(
                (m) => m.role === t.role && !m.isFinal,
              );
              if (partialIndex !== -1) {
                updatedConversation[partialIndex] = {
                  role: t.role,
                  text: t.transcript,
                  timestamp: updatedConversation[partialIndex].timestamp,
                  isFinal: true,
                };
              } else {
                updatedConversation.push({
                  role: t.role,
                  text: t.transcript,
                  timestamp,
                  isFinal: true,
                });
              }
            } else {
              // Add partial message or update the existing one
              const partialIndex = updatedConversation.findIndex(
                (m) => m.role === t.role && !m.isFinal,
              );
              if (partialIndex !== -1) {
                updatedConversation[partialIndex] = {
                  ...updatedConversation[partialIndex],
                  text: t.transcript,
                };
              } else {
                updatedConversation.push({
                  role: t.role,
                  text: t.transcript,
                  timestamp,
                  isFinal: false,
                });
              }
            }
            return updatedConversation;
          });
        }

        if (
          msg.type === "function-call" &&
          (msg as FunctionCallMsg).functionCall?.name === "changeUrl"
        ) {
          const command = String((msg as FunctionCallMsg).functionCall.parameters?.url || '').toLowerCase();
          console.log(command);
          if (command) {
            window.location.href = command;
          } else {
            console.error("Unknown route:", command);
          }
        }
      });

      vapiInstance.on("error", (e: Error) => {
        console.error("Vapi error:", e);
      });
    }
  }, []);

  useEffect(() => {
    initializeVapi();

    // Cleanup function to end call and dispose Vapi instance
    return () => {
    try { vapiRef.current?.stop?.(); } catch {}
    vapiRef.current = null;
    };
  }, [initializeVapi]);

  const checkAudioSupport = async () => {
    if (typeof window === 'undefined') return 'Unsupported environment';
    if (window.isSecureContext === false) {
      return 'Microphone requires HTTPS (secure context).';
    }
  const md: MediaDevices | undefined = (navigator as Navigator & { mediaDevices?: MediaDevices }).mediaDevices;
  const hasMedia = !!(md && typeof md.getUserMedia === 'function');
    if (!hasMedia) {
      return 'This browser does not support microphone access (getUserMedia).';
    }
    try {
      // Probe permissions without prompting if possible
      const permsAPI = (navigator as Navigator & { permissions?: { query?: (q: { name: PermissionName }) => Promise<PermissionStatus> } }).permissions;
      if (permsAPI?.query) {
        const status = await permsAPI.query({ name: 'microphone' as PermissionName });
        if (status.state === 'denied') {
          return 'Microphone permission is denied in browser settings.';
        }
      }
    } catch {}
    return null;
  };

  const toggleCall = async () => {
    try {
      setVoiceError(null);
      if (isSessionActive) {
        if (vapiRef.current?.stop) await vapiRef.current.stop();
      } else {
        const supportErr = await checkAudioSupport();
        if (supportErr) {
          setVoiceError(supportErr);
          return;
        }
        if (!publicKey || !assistantId) {
          setVoiceError('Missing Vapi configuration. Set NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID.');
          return;
        }
        if (vapiRef.current?.start) await vapiRef.current.start(assistantId);
      }
    } catch (err) {
      console.error("Error toggling Vapi session:", err);
      setVoiceError((err as Error)?.message || 'Unknown voice error.');
    }
  };

  const sendMessage = (role: string, content: string) => {
    if (vapiRef.current?.send) {
      vapiRef.current.send({
        type: "add-message",
        message: { role, content },
      });
    }
  };

  const say = (message: string, endCallAfterSpoken = false) => {
    if (vapiRef.current?.say) {
      vapiRef.current.say(message, endCallAfterSpoken);
    }
  };

  const toggleMute = () => {
    if (vapiRef.current?.setMuted) {
      const newMuteState = !isMuted;
      vapiRef.current.setMuted(newMuteState);
      setIsMuted(newMuteState);
    }
  };

  return {
    volumeLevel,
    isSessionActive,
    conversation,
    voiceError,
    toggleCall,
    sendMessage,
    say,
    toggleMute,
    isMuted,
  };
};

export default useVapi;