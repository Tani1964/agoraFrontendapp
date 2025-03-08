import { useState, useEffect } from "react";
import {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";

export const VideoCall = () => {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  return (
    <AgoraRTCProvider client={client}>
      <Basics />
    </AgoraRTCProvider>
  );
};

const APP_ID = "9a995d36550b4bd4b247fc391a77991a";
const CHANNEL = "lll";

const Basics = () => {
  const [calling, setCalling] = useState(false);
  const [token, setToken] = useState(null); // Start with null token
  const isConnected = useIsConnected();
  const [appId, setAppId] = useState(APP_ID);
  const [channel, setChannel] = useState(CHANNEL);
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  const remoteUsers = useRemoteUsers();

  // Fetch token when component mounts or channel changes
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(
          `https://algora-test-server.vercel.app/api/access_token?channelName=${channel}&uid=0`
        );
        const data = await response.json();
        if (data.token) {
          setToken(data.token);
          console.log("Fetched Token:", data.token);
        } else {
          console.error("Token fetch failed:", data.error);
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };
    fetchToken();
  }, [channel]);

  useJoin({ appid: appId, channel: channel, token: token }, calling);
  usePublish([localMicrophoneTrack, localCameraTrack]);

  return (
    <>
      <div>
        {isConnected ? (
          <div>
            <LocalUser
              audioTrack={localMicrophoneTrack}
              cameraOn={cameraOn}
              micOn={micOn}
              videoTrack={localCameraTrack}
              style={{ width: "40vw", height: 300 }}
            >
              <samp>You</samp>
            </LocalUser>
            {remoteUsers.map((user) => (
              <div key={user.uid}>
                <RemoteUser user={user} style={{ width: "90%", height: 300 }}>
                  <samp>{user.uid}</samp>
                </RemoteUser>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <input
              onChange={(e) => setAppId(e.target.value)}
              placeholder="<Your app ID>"
              value={appId}
            />
            <input
              onChange={(e) => setChannel(e.target.value)}
              placeholder="<Your channel Name>"
              value={channel}
            />
            <button
              disabled={!appId || !channel || !token} // Wait for token
              onClick={() => setCalling(true)}
            >
              <span>Join Channel</span>
            </button>
          </div>
        )}
      </div>
      {isConnected && (
        <div style={{ padding: "20px" }}>
          <button onClick={() => setMic((a) => !a)}>
            {micOn ? "Disable mic" : "Enable mic"}
          </button>
          <button onClick={() => setCamera((a) => !a)}>
            {cameraOn ? "Disable camera" : "Enable camera"}
          </button>
          <button onClick={() => setCalling((a) => !a)}>
            {calling ? "End calling" : "Start calling"}
          </button>
        </div>
      )}
    </>
  );
};

export default VideoCall;