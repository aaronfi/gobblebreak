class OmniauthCallbacksController < Devise::OmniauthCallbacksController
    def google_oauth2
        @user = User.from_omniauth(request.env["omniauth.auth"])
        @user.skip_confirmation!

        #if @user.persisted?
            # TODO reinstate or delete bootstrap-level flash/banner message for successful sign-in
            # flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "Google"
            sign_in_and_redirect @user, :event => :authentication
        #else
        #    session["devise.google_data"] = request.env["omniauth.auth"]
        #    redirect_to new_user_registration_url
       # end
    end

    def facebook
        @user = User.from_omniauth(request.env["omniauth.auth"])
        @user.skip_confirmation!

      #  if @user.persisted?
            # sign_in_and_redirect @user, :event => :authentication #this will throw if @user is not activated
            # set_flash_message(:notice, :success, :kind => "Facebook") if is_navigational_format?
            sign_in_and_redirect @user, :event => :authentication
      #  else
      #      session["devise.facebook_data"] = request.env["omniauth.auth"]
      #      redirect_to new_user_registration_url
      #  end
    end
end