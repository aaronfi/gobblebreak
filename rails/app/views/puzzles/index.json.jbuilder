json.array!(@puzzles) do |puzzle|
  json.extract! puzzle, :obsfucated_id, :fen, :movetext, :pgn, :num_views, :num_completions, :num_ratings, :avg_rating, :difficulty_score
  json.url puzzle_url(puzzle, format: :json)
end