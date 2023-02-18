import React from 'react';
import { Avatar, List, Skeleton } from 'antd';

const ResultsList = ({ initLoading, searchResults }) => {
  return (
    <List
      loading={initLoading}
      itemLayout="horizontal"
      loadMore={console.log}
      dataSource={searchResults}
      renderItem={(result) => (
        <List.Item actions={[<a key="list-loadmore-edit">export csv</a>]}>
          <Skeleton avatar title={false} loading={false} active>
            <List.Item.Meta
              avatar={<Avatar src={(result?.album?.thumbs[2] || {}).url} />}
              title={result?.name}
              description={result?.album?.name}
            />
            <div>
              Total streams from {}
              {result?.perodTotalStreams?.toLocaleString()}
            </div>
          </Skeleton>
        </List.Item>
      )}
    />
  );
};

export default ResultsList;
