import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Parser } from 'json2csv';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [understandingStatus, setUnderstandingStatus] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [understandingData, setUnderstandingData] = useState<Record<number, string>>({});
  const [csvData, setCsvData] = useState<string | null>(null);
  const [csvUrl, setCsvUrl] = useState<string | null>(null);

  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if(e.target.files) {
      setVideo(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUnderstandingStatusChange = () => {
    setUnderstandingStatus(!understandingStatus);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  const updateUnderstandingData = () => {
    if(videoRef.current) {
      const currentTime = Math.floor(videoRef.current.currentTime);
      setUnderstandingData(prevData => ({
        ...prevData,
        [currentTime]: understandingStatus ? '理解したふりをしている' : '理解したふりをしていない',
      }));
    }
  };

  const handleVideoEnd = () => {
    const parser = new Parser();
    const csv = parser.parse(understandingData);
    setCsvData(csv);
    const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    setCsvUrl(URL.createObjectURL(csvBlob));
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('timeupdate', updateUnderstandingData);
      videoRef.current.addEventListener('ended', handleVideoEnd);
      return () => {
        if(videoRef.current) {
          videoRef.current.removeEventListener('timeupdate', updateUnderstandingData);
          videoRef.current.removeEventListener('ended', handleVideoEnd);
        }
      };
    }
  }, [videoRef.current]);

  const VideoPlayer = video ? (
    <video ref={videoRef} controls src={video} playbackRate={playbackRate}>
      Your browser does not support HTML5 video.
    </video>
  ) : null;

  return (
    <div>
      <input type="file" accept="video/mp4" onChange={handleVideoUpload} />
      {VideoPlayer}
      <button onClick={handleUnderstandingStatusChange}>
        {understandingStatus ? '理解したふりをしている' : '理解したふりをしていない'}
      </button>
      <button onClick={() => handlePlaybackRateChange(1.5)}>1.5倍速</button>
      <button onClick={() => handlePlaybackRateChange(2)}>2倍速</button>
      {csvUrl && <a href={csvUrl} download="understanding_data.csv">理解したふりデータをダウンロード</a>}
    </div>
  );
}