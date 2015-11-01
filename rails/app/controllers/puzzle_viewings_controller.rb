class PuzzleViewingsController < ApplicationController
  before_action :set_puzzle_viewing, only: [:show, :edit, :update, :destroy]

  # GET /puzzle_viewings
  # GET /puzzle_viewings.json
  def index
    @puzzle_viewings = PuzzleViewing.all
  end

  # GET /puzzle_viewings/1
  # GET /puzzle_viewings/1.json
  def show
  end

  # GET /puzzle_viewings/new
  def new
    @puzzle_viewing = PuzzleViewing.new
  end

  # GET /puzzle_viewings/1/edit
  def edit
  end

  # POST /puzzle_viewings
  # POST /puzzle_viewings.json
  def create
    @puzzle_viewing = PuzzleViewing.new(puzzle_viewing_params)

    respond_to do |format|
      if @puzzle_viewing.save
        format.html { redirect_to @puzzle_viewing, notice: 'Puzzle viewing was successfully created.' }
        format.json { render action: 'show', status: :created, location: @puzzle_viewing }
      else
        format.html { render action: 'new' }
        format.json { render json: @puzzle_viewing.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /puzzle_viewings/1
  # PATCH/PUT /puzzle_viewings/1.json
  def update
    respond_to do |format|
      if @puzzle_viewing.update(puzzle_viewing_params)
        format.html { redirect_to @puzzle_viewing, notice: 'Puzzle viewing was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @puzzle_viewing.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /puzzle_viewings/1
  # DELETE /puzzle_viewings/1.json
  def destroy
    @puzzle_viewing.destroy
    respond_to do |format|
      format.html { redirect_to puzzle_viewings_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_puzzle_viewing
      @puzzle_viewing = PuzzleViewing.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def puzzle_viewing_params
      params.require(:puzzle_viewing).permit(:user_id, :puzzle_id, :start_date, :end_date, :num_seconds_viewed, :num_seconds_to_solve, :was_solved, :was_answer_asked_for, :num_attempts, :num_hints_used, :level_of_hint_used, :user_current_rating)
    end
end
