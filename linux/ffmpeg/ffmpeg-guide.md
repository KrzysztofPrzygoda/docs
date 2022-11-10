# FFmpeg Guide
Autor: Krzysztof Przygoda, 2022

## Reference
- FFmpeg [Documentation](https://ffmpeg.org/documentation.html)

# Installation

## macOS

More installation options on [FFmpeg macOS guide](https://trac.ffmpeg.org/wiki/CompilationGuide/macOS).

### Ad-hoc installation
1. Download ffmpeg from https://www.ffmpeg.org/download.html#build-mac
2. Open *Terminal* and:
```bash
$ cd ~/Downloads
$ xattr -dr com.apple.quarantine ./ffmpeg
# Exclude ffmpeg from quarantine.
```
3. Double-click `ffmpeg` for the first time to check if runs properly.

### Homebrew installation
1. Install homebrew: https://brew.sh/
2. Install FFmpeg:
```bash
$ brew upgrade
$ brew install ffmpeg
```

#### Homebrew issues

```bash
# Error: Library not loaded: /opt/homebrew/opt/rav1e/lib/librav1e.0.5.dylib
# Solution:
$ brew uninstall ffmpeg
$ brew reinstall rav1e
$ brew install ffmpeg
```

# Usage

## Combine video with audio
```bash
$ ffmpeg -i video.mov -i audio.mp3 -c copy -map 0:0 -map 1:0 -shortest output.mov
$ ffmpeg -i video.mp4 -i audio.mp4 -c copy -map 0:0 -map 1:0 -shortest output.mp4
# Fast combine.
```
```bash
$ ffmpeg -i video.mp4 -i audio.mp3 -vf hflip -map 0:v -map 1:a -shortest output.mp4
# Combine and flip video horizontally, mirror (time consuming).
```

## Flip video

```bash
$ ffmpeg -i input.mp4 -vf vflip -c:a copy output.mp4
# Flip vertically.
```
```bash
$ ffmpeg -i input.mp4 -vf hflip -c:a copy output.mp4
# Flip horizontally (mirror).

# To process entire folder of *.mp4 files use:
for i in *.mp4;
do ffmpeg -i "$i" -vf hflip -c:a copy "$(basename "${i/.mp4}")-mirrored.mp4";
done;
```
## Rotate video
```bash
$ ffmpeg -i input.mp4 -vf transpose=1 -c:a copy output.mp4
# Rotate Video 90 degrees clockwise.
```
```bash
$ ffmpeg -i input.mp4 -vf transpose=2 -c:a copy output.mp4
# Rotate 90 degrees counterclockwise.
```

## Change video resolution

### Convert to 720p
```bash
$ ffmpeg -i input.mp4 -vf scale=-1:720 -c:v libx264 -crf 0 -preset veryslow -c:a copy output.mp4
# Highest quality video.
# Note that this video might not be playable on all devices or players.
```
```bash
$ ffmpeg -i input.mp4 -vf scale=-1:720 -c:v libx264 -crf 18 -preset veryslow -c:a copy output.mp4
# To get a "visually lossless" quality.

# -scale:<width>:<height> option is size control.
# To keep aspect ratio leave -1 on height or width.

# -crf option is quality control.
# The range of the quantizer scale is 0-51: where 0 is lossless, 23 is default, and 51 is worst possible. A lower value is a higher quality and a subjectively sane range is 18-28. Consider 18 to be visually lossless or nearly so: it should look the same or nearly the same as the input but it isn't technically lossless.
#The range is exponential, so increasing the CRF value +6 is roughly half the bitrate while -6 is roughly twice the bitrate. General usage is to choose the highest CRF value that still provides an acceptable quality. If the output looks good, then try a higher value and if it looks bad then choose a lower value.

# -preset option is compression efficiency.
# You control the tradeoff between video encoding speed and compression efficiency with the -preset options. Those are ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow. Default is medium. The veryslow option offers the best compression efficiency (resulting in a smaller file size for the same quality) but it is very slow – as the name says.
```

## Convert video mp4 to audio mp3

### Constant bitrate
```bash
$ ffmpeg -i video.mp4 -b:a 192K -vn audio.mp3
$ ffmpeg -i video.mp4 -b:a 128K -vn audio.mp3
# -vn option explicitly drops video so the conversion is much much faster. 
```
### Variable bitrate
Variable bitrate gives better compression ratio. See [Encoding VBR (Variable Bit Rate) mp3 audio](https://trac.ffmpeg.org/wiki/Encode/MP3).
```bash
$ ffmpeg -i video.mp4 -q:a 0 -map a audio.mp3
# -q option can only be used with libmp3lame and corresponds to the LAME -V option.

# To process entire folder use:
for i in *.mp4;
do ffmpeg -i "$i" -q:a 0 -map a "$(basename "${i/.mp4}").mp3";
done;
```

## Convert mov to mp4

### Encode
```bash
$ ffmpeg -i input.mov -vcodec h264 -acodec aac output.mp4
$ ffmpeg -i input.mov -c:v libx264 -c:a aac -vf format=yuv420p -movflags +faststart output.mp4

# -c:v libx264 choose encoder libx264 to output H.264 video.
# -c:a aac choose encoder aac to output AAC audio.
# -vf format=yuv420p chooses YUV 4:2:0 pixel format. libx264 supports many pixel formats and by default will choose a pixel format that most resembles the input. But not all pixel formats are supported by all players. yuv420p is the most compatible and universally supported.
# -movflags +faststart same as the Web Optimized option in Handbrake. After encoding completes it moves a chunk of info from the end of file to the beginning so it can start playing faster when viewing via download.
```
### Copy
You can [stream copy](https://ffmpeg.org/ffmpeg.html#Stream-copy) if the MOV file contains video and audio that is compatible with MP4:
```bash

$ ffmpeg -i input.mov -c copy -movflags +faststart output.mp4

# Stream copy (-c copy) is like a "copy and paste" so the quality is preserved and the process is fast.
# -movflags +faststart makes an output file that usable for HTML5 streaming, for example, putting all the necessary info to begin playback at the start of the file. If you only care about local desktop usage, you can leave that out.
# Video formats compatible with MP4 include: H.264, H.265/HEVC, AV1 (new format, so not universally supported), MPEG-4 (old format, not supported in HTML5).
# Audio formats compatible with MP4 include: AAC, MP3 (playback support depends on player), Opus (new format, so not universally supported).
```