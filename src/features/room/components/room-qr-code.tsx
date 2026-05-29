"use client";

import QRCode from "react-qr-code";

interface Props {
  roomCode: string;
}

export function RoomQrCode({ roomCode }: Props) {
  const joinUrl = `${window.location.origin}/join/${roomCode}`;

  return (
    <div
      className="
      rounded-2xl
      bg-white
      p-4
    "
    >
      <QRCode value={joinUrl} size={180} />
    </div>
  );
}
