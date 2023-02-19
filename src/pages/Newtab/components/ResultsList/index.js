import React from 'react';
import _ from 'lodash';
import dayjs from 'dayjs';
import { Table, Avatar, List, Skeleton, Collapse, Tabs } from 'antd';

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
      <div>Total streams for period {totalStreams}</div>
    </Skeleton>
  </List.Item>
);

const DataByMonthTable = ({ year }) => {
  const columns = [
    {
      title: 'Periodo',
      dataIndex: 'date',
    },
    {
      title: 'Streams',
      dataIndex: 'streams',
    },
    {
      title: 'Fechas dia mes año',
      dataIndex: 'period',
    },
  ];

  const byMonth = _.mapValues(year, (month, key) => {
    const nextMonth = year[Number(key) + 1];

    const firstDay = month[0]?.value;
    const lastDay = nextMonth
      ? nextMonth[0]?.value
      : month[month.length - 1]?.value;

    return lastDay - firstDay;
  });

  return (
    <Table
      columns={columns}
      dataSource={Object.keys(year).map((monthNumber, i) => {
        const month = year[monthNumber];
        /* const firstDay = month[0];
           const lastDay = month[month.length - 1]; */
        const firstDate = dayjs.tz(month[0].date).format('DD-MM-YYYY');
        const lastDate = dayjs
          .tz(month[month.length - 1].date)
          .format('DD-MM-YYYY');
        const numberOfDays = dayjs
          .tz(month[month.length - 1].date)
          .diff(dayjs.tz(month[0].date), 'day');
        return {
          key: i,
          date: `${monthNames[monthNumber]} - ${numberOfDays + 1} días`,
          streams: byMonth[monthNumber]?.toLocaleString(),
          period: `Desde ${firstDate} hasta ${lastDate}`,
        };
      })}
    />
  );
};

const DataByYearTable = ({ data }) => {
  const columns = [
    {
      title: 'Periodo',
      dataIndex: 'date',
    },
    {
      title: 'Streams',
      dataIndex: 'streams',
    },
    {
      title: 'Fechas dia mes año',
      dataIndex: 'period',
    },
  ];

  const byYear = _.mapValues(data.streamsByDate, (year, key) => {
    const nextYear = data.streamsByDate[Number(key) + 1];

    const monthsCurrent = Object.keys(year).sort((a, b) => a - b);
    const monthsNext = nextYear && Object.keys(nextYear).sort((a, b) => a - b);
    const firstMonth = monthsCurrent[0];
    const lastMonth = monthsCurrent[monthsCurrent.length - 1];

    const lastMonthLastDay = nextYear
      ? nextYear[monthsNext[0]][0]?.value
      : year[lastMonth][year[lastMonth].length - 1]?.value;

    return lastMonthLastDay - year[firstMonth][0]?.value;
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
          .tz(data.streamsByDate[year][firstMonth][0].date)
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
            <Tabs
              defaultActiveKey="1"
              items={[
                result,
                ...Object.keys(result.streamsByDate).map((k) => ({
                  ...result.streamsByDate[k],
                  year: k,
                })),
              ].map((data, i) => {
                const year = data.year;
                if (i) {
                  delete data.year;
                }
                const id = result?.uuid + year;
                return {
                  label: !i ? 'By year' : year,
                  key: id,
                  children: i
                    ? DataByMonthTable({ year: data })
                    : DataByYearTable({ data }),
                };
              })}
            />
          </Panel>
        </Collapse>
      )}
    />
  );
};

export default ResultsList;
