import React from 'react';
import { Space, Alert } from 'antd';

const MessageList = ({ messages = [] }) => {
  console.log('!!!!!!!!!!22222222', messages, messages[0]);
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {messages?.map((m, i) => (
        <Alert
          key={i}
          message={m.message}
          description={`Track: ${m.name || ''} Artist: ${
            m.artist || ''
          } Album: ${m.album || ''}`}
          type="warning"
          showIcon
          closable
        />
      ))}
    </Space>
  );
};

export default MessageList;
