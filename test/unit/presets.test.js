// Test related imports.
import 'chai/register-expect'

import presets from '../../src/ffmpeg/presets'

describe('tests presets module', function() {
  it('stereoVr180x180to2d', function() {
    const received = presets.vf.stereoVr180x180to2d(1920)(1080)
    const expected = {
     argument: '-vf',
     constraints: [],
     value: 'v360=fisheye:flat:ih_fov=180:iv_fov=180:h_fov=120:v_fov=90:in_stereo=sbs:out_stereo=2d:w=1920:h=1080' 
    }
    
    expect(received).to.deep.equal(expected)
  })
})