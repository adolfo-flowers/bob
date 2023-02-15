import React from 'react';
import { Col, Row } from 'antd';
import SearchForm from './components/SearchForm';
import { addSpotifyStreamCount, addSoundChartsId } from './api/soundCharts';
import { searchSpotify } from './api/spotify';
import './Newtab.css';
import './Newtab.scss';

const Newtab = () => (
  <div className="App">
    <Row style={{ height: '100%' }} gutter={[8, 8]}>
      <Col span={12}>
        <section style={{ padding: '30px' }}>
          <SearchForm
            onSubmit={async (data) => {
              const { artist, track, album, dates } = data;
              const [startDate, endDate] = dates.map((d) =>
                d.format('YYYY-MM-DD')
              );
              console.log(startDate, endDate);

              const songData = await addSpotifyStreamCount({
                songs: await addSoundChartsId(
                  await searchSpotify({ track, artist, album })
                ),
                startDate,
                endDate,
              });
              console.log(songData);
            }}
          />
        </section>
      </Col>
      <Col span={12}>
        <section style={{ padding: '30px' }}>
          <h1>Hello</h1>
        </section>
      </Col>
      <Col span={12}>
        <section style={{ padding: '30px' }}>
          <h1>Hello</h1>
        </section>
      </Col>

      <Col span={12}>
        <section style={{ padding: '30px' }}>
          <h1>Hello</h1>
        </section>
      </Col>
    </Row>
  </div>
);

export default Newtab;
