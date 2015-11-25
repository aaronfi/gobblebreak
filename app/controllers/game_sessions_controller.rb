class GameSessionsController < ApplicationController
    # Prevent CSRF attacks by raising an exception.
    # For APIs, you may want to use :null_session instead.
    protect_from_forgery with: :exception

    def create
        @game_session = GameSession.new(game_session_params)
        @game_session.session_id = session.id
        @game_session.user = current_user if current_user
        @game_session.save

        render :nothing => true
    end

    private

    def game_session_params
        params.require(:game_session).permit(
            [
                :game_url,
                {
                    event_log: {
                        _events: [ :timer, :delta, :event ]
                    },
                },
                :_lastTimerSnapshot,
                :size
            ]
        );
    end
end
