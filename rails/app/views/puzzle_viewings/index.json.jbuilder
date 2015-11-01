json.array!(@puzzle_viewings) do |puzzle_viewing|
  json.extract! puzzle_viewing, :user_id, :puzzle_id, :start_date, :end_date, :num_seconds_viewed, :num_seconds_to_solve, :was_solved, :was_answer_asked_for, :num_attempts, :num_hints_used, :level_of_hint_used, :user_current_rating
  json.url puzzle_viewing_url(puzzle_viewing, format: :json)
end