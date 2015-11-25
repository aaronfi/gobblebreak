class SessionsController < ApplicationController
    def create
        user = User.from_omniauth(env["omniauth.auth"])
        session[:user_id] = user.id
        redirect_to root_path
    end

    def destroy
        session[:user_id] = nil
        sign_out(current_user)
        redirect_to root_path
    end
end