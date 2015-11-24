class GameSessionsController < ApplicationController
    # Prevent CSRF attacks by raising an exception.
    # For APIs, you may want to use :null_session instead.
    protect_from_forgery with: :exception

    def create
        @game_session = GameSession.new(game_session_params)
        @game_session.user = current_user  #TODO this isn't actually working, because Idon't have anonymous users
        @game_session.save

        render :nothing => true
    end

    private

    def game_session_params
        params.require(:game_session).permit!   #TODO dangeorus, but this fucking thing is fighting me, won't acknowledge event_log because (???) it's a nested object?
    end
end
