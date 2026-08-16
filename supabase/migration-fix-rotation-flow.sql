-- Golf Swing Rotation Flow: rename + diagonal cue + golf-specific demo search.
-- The generic name pulled flat transverse-plane demos; the drill follows
-- the swing plane (diagonal). Coach-caught correction.
update exercises set
  name = 'Golf Swing Rotation Flow (no club)',
  notes = 'Continuous, no pauses — follow the swing plane DIAGONALLY: low trail-hip backswing up to a high finish. Hips lead, smooth both directions',
  video_url = 'https://www.youtube.com/results?search_query=golf+rotation+mobility+drill+backswing+to+finish+no+club'
where id = '5b3d1f13-5b6e-5e19-9678-2a8635c81549';

select name, notes, video_url from exercises where id = '5b3d1f13-5b6e-5e19-9678-2a8635c81549';
