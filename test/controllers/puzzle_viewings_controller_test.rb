require 'test_helper'

class PuzzleViewingsControllerTest < ActionController::TestCase
  setup do
    @puzzle_viewing = puzzle_viewings(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:puzzle_viewings)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create puzzle_viewing" do
    assert_difference('PuzzleViewing.count') do
      post :create, puzzle_viewing: { end_date: @puzzle_viewing.end_date, level_of_hint_used: @puzzle_viewing.level_of_hint_used, num_attempts: @puzzle_viewing.num_attempts, num_hints_used: @puzzle_viewing.num_hints_used, num_seconds_to_solve: @puzzle_viewing.num_seconds_to_solve, num_seconds_viewed: @puzzle_viewing.num_seconds_viewed, puzzle_id: @puzzle_viewing.puzzle_id, start_date: @puzzle_viewing.start_date, user_current_rating: @puzzle_viewing.user_current_rating, user_id: @puzzle_viewing.user_id, was_answer_asked_for: @puzzle_viewing.was_answer_asked_for, was_solved: @puzzle_viewing.was_solved }
    end

    assert_redirected_to puzzle_viewing_path(assigns(:puzzle_viewing))
  end

  test "should show puzzle_viewing" do
    get :show, id: @puzzle_viewing
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @puzzle_viewing
    assert_response :success
  end

  test "should update puzzle_viewing" do
    patch :update, id: @puzzle_viewing, puzzle_viewing: { end_date: @puzzle_viewing.end_date, level_of_hint_used: @puzzle_viewing.level_of_hint_used, num_attempts: @puzzle_viewing.num_attempts, num_hints_used: @puzzle_viewing.num_hints_used, num_seconds_to_solve: @puzzle_viewing.num_seconds_to_solve, num_seconds_viewed: @puzzle_viewing.num_seconds_viewed, puzzle_id: @puzzle_viewing.puzzle_id, start_date: @puzzle_viewing.start_date, user_current_rating: @puzzle_viewing.user_current_rating, user_id: @puzzle_viewing.user_id, was_answer_asked_for: @puzzle_viewing.was_answer_asked_for, was_solved: @puzzle_viewing.was_solved }
    assert_redirected_to puzzle_viewing_path(assigns(:puzzle_viewing))
  end

  test "should destroy puzzle_viewing" do
    assert_difference('PuzzleViewing.count', -1) do
      delete :destroy, id: @puzzle_viewing
    end

    assert_redirected_to puzzle_viewings_path
  end
end
