import React from 'react';
import _ from 'lodash';
import { Table, Avatar, List, Skeleton, Collapse } from 'antd';

const { Panel } = Collapse;
const ListItem = ({ artist, trackName, album, totalStreams, thumbUrl }) => (
  <List.Item actions={[<a key="list-loadmore-edit">export csv</a>]}>
    <Skeleton avatar title={false} loading={false} active>
      <List.Item.Meta
        avatar={<Avatar src={thumbUrl} />}
        title={trackName}
        description={
          <div>
            <b>{artist}</b>&nbsp; {album}
          </div>
        }
      />
      <div>Artist: Total streams for period {totalStreams}</div>
    </Skeleton>
  </List.Item>
);

const DataTable = ({ data }) => {
  const columns = [
    {
      title: 'Period',
      dataIndex: 'date',
    },
    {
      title: 'Streams',
      dataIndex: 'streams',
    },
    {
      title: 'months',
      dataIndex: 'months',
    },
  ];
  const byYear = _.mapValues(data.totalStreamsByYearAndMonth, (year) => {
    return _.reduce(
      year,
      (result, month) =>
        month.reduce((acc, day) => day.value + acc, 0) + result,
      0
    );
  });

  return (
    <Table
      columns={columns}
      dataSource={Object.keys(byYear).map((k, i) => {
        const months = Object.keys(data.totalStreamsByYearAndMonth[k]);
        const firstMonth = months[months.length - 1];
        const lastMonth = months[0];
        return {
          key: i,
          date: `${k} ${firstMonth}-${lastMonth}`,
          streams: byYear[k].toLocaleString(),
          months: _.reduce(
            data.totalStreamsByYearAndMonth[k],
            (acc, days, month) => `Days in ${month}: ${days.length}, ${acc}`,
            ''
          ),
        };
      })}
    />
  );
};

const ResultsList = ({ initLoading, searchResults }) => {
  return (
    <List
      loading={initLoading}
      itemLayout="horizontal"
      loadMore={console.log}
      dataSource={searchResults}
      renderItem={(result) => (
        <Collapse onChange={console.log}>
          <Panel
            key={result?.uuid}
            header={ListItem({
              trackName: result?.trackName,
              album: result?.album?.name,
              artist: result?.artist,
              totalStreams: result?.perodTotalStreams?.toLocaleString(),
              thumbUrl: (result?.album?.thumbs[2] || {}).url,
            })}
          >
            <DataTable data={result} />
          </Panel>
        </Collapse>
      )}
    />
  );
};

export default ResultsList;
