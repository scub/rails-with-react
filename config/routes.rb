require 'sidekiq/web'

Rails.application.routes.draw do
  # No auth — same local-only caveat as Grafana's anonymous admin login (see
  # the README's Observability section).
  mount Sidekiq::Web => '/sidekiq'

  # Rails' whole job for a page load: authorize, then serve the same empty shell.
  # React Router (frontend/app/javascript/router.jsx) owns everything under "/".
  root to: 'boards#show'
  get '/boards/:id', to: 'boards#show', as: :board

  namespace :api do
    namespace :v1 do
      resources :boards, only: [] do
        resources :notes, only: %i[index create]
      end
    end
  end

  mount ActionCable.server => '/cable'
end
