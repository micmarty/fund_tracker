Rails.application.routes.draw do
  root 'funds#index'
  get '/compare' => 'comparator#index', as: 'compare'
end
