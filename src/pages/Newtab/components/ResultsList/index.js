import React from 'react';
import _ from 'lodash';
import dayjs from 'dayjs';
import { Table, Avatar, List, Skeleton, Collapse } from 'antd';

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

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
      title: 'Fechas',
      dataIndex: 'period',
    },
  ];

  const byYear = _.mapValues(data.streamsByDate, (year) => {
    const months = Object.keys(year).sort((a, b) => a - b);
    const firstMonth = months[0];
    const lastMonth = months[months.length - 1];

    return (
      year[lastMonth][0]?.value -
      year[firstMonth][year[firstMonth]?.length - 1]?.value
    );
  });

  return (
    <Table
      columns={columns}
      dataSource={Object.keys(byYear).map((year, i) => {
        const months = Object.keys(data.streamsByDate[year]).sort(
          (a, b) => a - b
        );
        const firstMonth = months[0];
        const lastMonth = months[months.length - 1];
        const firstDate = dayjs
          .tz(
            data.streamsByDate[year][firstMonth][
              data.streamsByDate[year][firstMonth].length - 1
            ].date
          )
          .format('DD-MM-YYYY');
        const lastDate = dayjs
          .tz(
            data.streamsByDate[year][lastMonth][
              data.streamsByDate[year][lastMonth].length - 1
            ].date
          )
          .format('DD-MM-YYYY');

        return {
          key: i,
          date: `${year} ${monthNames[firstMonth]}-${monthNames[lastMonth]}`,
          streams: byYear[year].toLocaleString(),
          period: `Desde ${firstDate} hasta ${lastDate}`,
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
