const MessageList = () => {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {state?.messages?.map((m, i) => (
        <Alert
          key={i}
          message=""
          description={m.message}
          type="warning"
          showIcon
          closable
        />
      ))}
    </Space>
  );
};

export default MessageList;
