module.exports = app => {

  const video = require('../interface/ffmpeg/video.interface');

  app.use('/api/V.0.1',
    video,
  );
};
