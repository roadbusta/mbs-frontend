import React from 'react';
import { Composition } from 'remotion';
import { AutoMBSMarketingClip } from './AutoMBSMarketingClip';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AutoMBSMarketing"
        component={AutoMBSMarketingClip}
        durationInFrames={900} // 30 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "AutoMBS: AI-Powered Medical Billing",
          subtitle: "Transform Your Healthcare Practice",
        }}
      />
    </>
  );
};