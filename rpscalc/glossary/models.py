from sqlalchemy import Table, Column, String
from rpscalc.models import Base, PublishMixin, TextMixin, SlugMixin


class GlossaryEntry(PublishMixin, SlugMixin, TextMixin, Base):
    pass

