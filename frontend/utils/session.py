import streamlit as st


def initialize():

    if "cart" not in st.session_state:
        st.session_state.cart = []

    if "user" not in st.session_state:
        st.session_state.user = None

    if "token" not in st.session_state:
        st.session_state.token = None