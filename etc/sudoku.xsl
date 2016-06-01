<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:template match="/">
        <div id="sudoku">
            <table>
                <xsl:for-each select="/sudoku/row">
                    <tr>
                        <xsl:for-each select="./cell">
                            <xsl:choose>
                                <xsl:when test=". != ''">
                                    <td contenteditable="false">
                                        <xsl:value-of select="current()"/>
                                    </td>
                                </xsl:when>
                                <xsl:otherwise>
                                    <td contenteditable="true">
                                        <xsl:value-of select="current()"/>
                                    </td>
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:for-each>
                    </tr>
                </xsl:for-each>

            </table>
        </div>
    </xsl:template>

</xsl:stylesheet>